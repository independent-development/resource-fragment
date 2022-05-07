const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");
const { promisify } = require("util");

const FragmentRecoder = require("./fragment_recoder");

const encode_dir = path.resolve(__dirname, "./encode/");
const input_file = path.resolve(__dirname, "./input/test2.mp4");

/** 用户的唯一签名秘钥是一个uuid **/
const secret_key = "f0cb9403-3766-4fea-9dc6-e129a1488c55";

async function encode() {
  /** 实例化一个过程记录者 **/
  const record = new FragmentRecoder();
  /** 读取文件 **/
  const resource_buffer = await promisify(fs.readFile)(input_file);
  record.origin_file_path = input_file;
  record.origin_file_content = resource_buffer.buffer;
  /** 计算切片大小 **/
  const unit_size = 2048000;
  record.unit_size = unit_size;
  /** 计算头部的二进制填充 **/
  // const header_pedding_buffer = new Uint8Array(Array(unit_size).fill(1));
  /** 文件尾需要填充的字符串 **/
  const footer_pedding_buffer = new Uint8Array(Array(unit_size - resource_buffer.length % unit_size).fill(1));
  /** 获取到最终资源的内容 **/
  const concat_resourse_buffer = Buffer.concat([resource_buffer, footer_pedding_buffer]);
  /** 计算文件实际需要切割的份数 **/
  record.concat_content_size = concat_resourse_buffer.length;
  const splite_block = concat_resourse_buffer.length / unit_size;
  record.pieces = splite_block;
  /** 执行切割 **/
  console.log(`实际需要切分成 ${splite_block} 份`);
  let current_count = 0;
  // const splite_sign_array = [];
  while (current_count !== splite_block) {
    const every_origin_block = Buffer.from(concat_resourse_buffer.slice(current_count * unit_size, unit_size * (current_count + 1)));
    const every_origin_content = new Uint8Array(every_origin_block.buffer);
    const output_file_path = path.join(encode_dir, `${current_count + 1}.txt`);
    const encode_content = CryptoJS.AES.encrypt(every_origin_content.toString(), secret_key).toString();
    await promisify(fs.writeFile)(output_file_path, encode_content, "utf-8");
    current_count += 1;
    console.log(`fragment ${current_count} complate!`);
  }
  const record_content = FragmentRecoder.stringify(record, secret_key);
  const record_save_path = path.join(encode_dir, "0.txt");
  await promisify(fs.writeFile)(record_save_path, record_content);
};

encode();