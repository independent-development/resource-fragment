const fs = require("fs");
const path = require("path");
const glob = require("glob");
const CryptoJS = require("crypto-js");
const { promisify } = require("util");

const FragmentRecoder = require("./fragment_recoder");

const secret_key = "f0cb9403-3766-4fea-9dc6-e129a1488c55";

const encode_dir = path.resolve(__dirname, "./encode/");
const decode_dir = path.resolve(__dirname, "./decode/");
const record_file_path = path.join(encode_dir, "./0.txt");
const encode_glob = "./encode/*.txt";

async function decode() {
  const encode_record_file = await promisify(fs.readFile)(record_file_path, "utf-8");
  const record = FragmentRecoder.parse(encode_record_file, secret_key);
  console.log(record);
  const { unit_size, origin_file_name, origin_file_size } = record;
  const header_buffer_pedding = new Uint8Array(Array(unit_size).fill(0));
  const match_fragment = await promisify(glob)(encode_glob);
  const decode_task = match_fragment.slice(1, match_fragment.length).map(async (single_fragment_path, index) => {
    // console.log(`正在处理第 ${index + 1} 个片段`);
    const single_fragment_content = await promisify(fs.readFile)(single_fragment_path, "utf-8");
    // console.log(single_fragment_content);
    const decrypt_origin_content = CryptoJS.AES.decrypt(single_fragment_content, secret_key).toString(CryptoJS.enc.Utf8);
    const decode_origin_content = new Uint8Array(decrypt_origin_content.split(","));
    // console.log(`片段 ${index + 1} 处理成功!`);
    return Buffer.from(decode_origin_content);
  });
  const concat_decode_content = Buffer.concat(await Promise.all(decode_task));
  console.log(concat_decode_content);
  const origin_file_content = concat_decode_content.slice(header_buffer_pedding.length, header_buffer_pedding.length + origin_file_size);
  const save_file_path = path.join(decode_dir, origin_file_name);
  await promisify(fs.writeFile)(save_file_path, origin_file_content, "utf-8");
};

decode();