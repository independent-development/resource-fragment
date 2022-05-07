const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const output_dir = path.resolve(__dirname, "./output/");
const input_file = path.resolve(__dirname, "./input/3xplanet_0620-vdd-082.mp4");

/** 用户的唯一签名秘钥是一个uuid **/
const secret_key = "f0cb9403-3766-4fea-9dc6-e129a1488c55";
/** 暂且使用2048000的单位对文件进行切片 **/
const unit_size = 2048000;

async function splite_sign_method() {
  const resource_buffer = await promisify(fs.readFile)(input_file);
  /** 计算头部的二进制填充 **/
  const header_buffer_pedding = Buffer.from(Array(unit_size).fill(0));
  /** 文件尾需要填充的字符串 **/
  const footer_buffer_pedding = Buffer.from(Array(unit_size - resource_buffer.length % unit_size).fill(0));
  /** 获取到最终资源的内容 **/
  const computed_resourse_buffer = Buffer.concat([
    header_buffer_pedding,
    resource_buffer,
    footer_buffer_pedding
  ], header_buffer_pedding.length + resource_buffer.length + footer_buffer_pedding.length);
  /** 计算文件实际需要切割的份数 **/
  const splite_block = parseInt(computed_resourse_buffer.length / unit_size);
  /** 执行切割 **/
  console.log(`实际需要切分成 ${splite_block} 份`);
  let current_count = 0;
  // const splite_sign_array = [];
  while (current_count !== splite_block) {
    const every_origin_block = computed_resourse_buffer.slice(current_count * unit_size, unit_size * (current_count + 1));
    // splite_sign_array.push(every_origin_block);
    const output_file_path = path.join(output_dir, current_count.toString());
    await promisify(fs.writeFile)(output_file_path, every_origin_block);
    current_count += 1;
    console.log(`fragment ${current_count} complate!`);
  }
  // return splite_sign_array;
};

splite_sign_method(10);