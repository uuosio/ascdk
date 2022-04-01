#!/usr/bin/env ts-node-transpile-only
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var import_src = require("../src/index");
const main = async () => {
  const { default: child_process } = await import("child_process");
  const tailArgs = process.argv.indexOf("--");
  if (~tailArgs) {
    child_process.spawnSync(process.argv[0], process.argv.slice(tailArgs + 1).concat(process.argv.slice(1, tailArgs)), { stdio: "inherit" });
    return;
  }
  try {
    require("source-map-support").install();
  } catch (e) {
  }
  const { default: asc } = await import("assemblyscript/dist/asc.js");
  const { default: path } = await import("path");
  const ARGS = [
    "--initialMemory",
    "1",
    "--runtime",
    "stub",
    "--use",
    "abort= ",
    "-O2",
    "--disable",
    "mutable-globals",
    "--disable",
    "sign-extension",
    "--disable",
    "nontrapping-f2i",
    "--disable",
    "bulk-memory",
    "--transform",
    "eosio-asc/index.ts"
  ];
  const { APIOptionImpl } = await import("eosio-asc/src/ascoption.js");
  const memoryStream = asc.createMemoryStream();
  const apiOptions = new APIOptionImpl({
    stdout: memoryStream,
    stderr: memoryStream,
    listFiles: () => [],
    transforms: [new import_src.ContractTransform()]
  });
  const args = process.argv.slice(2).concat(ARGS);
  await asc.main(args);
  let sourcePath = process.argv[2];
  if (sourcePath) {
    console.log("Build progressing. Generating target files \xB7\xB7\xB7\xB7\xB7\xB7");
    let dirname = path.dirname(sourcePath);
    let targetName = sourcePath.split(path.sep).slice(-1)[0].replace(/.ts$/, "");
    let wasmPath = path.join(dirname, "target", `${targetName}.wasm`);
    let wastPath = path.join(dirname, "target", `${targetName}.wast`);
    apiOptions.transforms = [];
    args.push("-b", wasmPath);
    args.push("-t", wastPath);
    await asc.main(args, apiOptions);
    apiOptions.writeExtensionFile();
    console.log(`Build Done. Targets generated. Target directory: ${path.join(dirname, "target")}.`);
  }
};
main();
