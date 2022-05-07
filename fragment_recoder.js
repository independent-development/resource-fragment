const md5 = require("md5");
const path = require("path");
const CryptoJS = require("crypto-js");


module.exports = class FragmentRecoder {
  /** 加密记录文件 **/
  static stringify(fragment_recoder_object, secret_key) {
    const stringify_content = JSON.stringify(fragment_recoder_object);
    return CryptoJS.AES.encrypt(stringify_content, secret_key).toString();
  }
  /** 解密记录文件 **/
  static parse(encode_stringify_content, secret_key) {
    const decode_json_object = CryptoJS.AES.decrypt(encode_stringify_content, secret_key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decode_json_object);
  }
  constructor () {
    /** 切分的片数 **/
    this.pieces = 0;
    /** 单块分片的大小 **/
    this.unit_size = 2048000;
    /** 原始文件的文件名 **/
    this.origin_file_name = "";
    /** 原始文件的大小 **/
    this.origin_file_size = 0;
    /** 原始文件的md5值 **/
    this.md5 = "";
    /** 经过拼接之后的文件实际大小 **/
    this.concat_content_size = 0;
  }
  set origin_file_path(value) {
    this.origin_file_name = path.basename(value);
  }
  set origin_file_content(value) {
    const content_string = value.toString();
    this.md5 = md5(content_string);
    this.origin_file_size = value.length;
  }
}