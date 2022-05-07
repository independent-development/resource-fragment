const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");
const { promisify } = require("util");

const FragmentRecoder = require("./fragment_recoder");

const encode_dir = path.resolve(__dirname, "./encode/");
const input_file = path.resolve(__dirname, "./input/20210312_1782415fad5_r1.mp4");

/** 用户的唯一签名秘钥是一个uuid **/
const secret_key = "f0cb9403-3766-4fea-9dc6-e129a1488c55";
/** 暂且使用2048000的单位对文件进行切片 **/
const unit_size = 2048000;

async function encode() {
  /** 实例化一个过程记录者 **/
  const record = new FragmentRecoder();
  record.origin_file_path = input_file;
  const resource_buffer = await promisify(fs.readFile)(input_file);
  record.origin_file_content = resource_buffer;
  /** 计算头部的二进制填充 **/
  const header_buffer_pedding = Buffer.from(Array(unit_size).fill(0));
  /** 文件尾需要填充的字符串 **/
  const footer_buffer_pedding = Buffer.from(Array(unit_size - resource_buffer.length).fill(0));
  /** 获取到最终资源的内容 **/
  const concat_resourse_buffer = Buffer.concat([header_buffer_pedding, resource_buffer, footer_buffer_pedding]);
  // console.log(concat_resourse_buffer.length);
  /** 计算文件实际需要切割的份数 **/
  record.concat_content_size = concat_resourse_buffer.length;
  const splite_block = parseInt(concat_resourse_buffer.length / unit_size);
  record.pieces = splite_block;
  /** 执行切割 **/
  console.log(`实际需要切分成 ${splite_block} 份`);
  let current_count = 0;
  // const splite_sign_array = [];
  while (current_count !== splite_block) {
    const every_origin_block = new Uint8Array(concat_resourse_buffer.buffer.slice(current_count * unit_size, unit_size * (current_count + 1)));
    const every_origin_content = every_origin_block.toString();
    // console.log("every_origin_content.length", every_origin_content.length);
    const output_file_path = path.join(encode_dir, `${current_count + 1}.txt`);
    const encode_content = CryptoJS.AES.encrypt(every_origin_content, secret_key).toString();
    await promisify(fs.writeFile)(output_file_path, encode_content, "utf-8");
    current_count += 1;
    console.log(`fragment ${current_count} complate!`);
  }
  const record_content = FragmentRecoder.stringify(record, secret_key);
  const record_save_path = path.join(encode_dir, "0.txt");
  await promisify(fs.writeFile)(record_save_path, record_content);
};

encode(10);