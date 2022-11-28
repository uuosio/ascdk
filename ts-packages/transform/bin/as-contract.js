#!/usr/bin/env node

const tailArgs = process.argv.indexOf("--");
if (~tailArgs) {
    require("child_process").spawnSync(
        process.argv[0],
        process.argv.slice(tailArgs + 1).concat(
            process.argv.slice(1, tailArgs)
        ),
        { stdio: "inherit" }
    );
    process.exit(1);
}
// await new Promise(r => setTimeout(r, 2000));
// console.log("++++++++go here!");

try { (await import("source-map-support")).install(); } catch (e) { }

export const asc = await import("as-contract/src/asc/asc.js");
// const asc = module.exports = require("assemblyscript/cli/asc.js");
import { APIOptionImpl } from "as-contract/dist/index.js"

import path from "path";
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const ARGS = [
    "--initialMemory", "1",
    "--runtime", "stub",
    "--use", "abort= ",
    "-O2z",
    "--disable", "mutable-globals",
    "--disable", "sign-extension",
    "--disable", "nontrapping-f2i",
    "--disable", "bulk-memory",
    "--transform", "as-contract/dist/index.js"
]

if (true) {
    console.log("Build Starting ······")
    var args = yargs(hideBin(process.argv)).argv
    if (args['_'].length > 0) {
        if (args['_'][0] == "gencode") {
            if (args['_'].length == 1) {
                console.log('usage: as-contract gencode [input file] -o [output dir]');
                process.exit(1);
            }
            let inputFile = args['_'][1];
            let outputDir = args['o'];
            args = args['_'].slice(1).concat(ARGS);
            process.exitCode = await asc.main(args);
            let apiOption = new APIOptionImpl();
            console.log('+++++++outputDir:', outputDir);
            apiOption.writeGeneratedFile(outputDir);
            process.exit(0);
        } else if (args['_'][0] == "build") {
            args = process.argv.slice(3).concat(ARGS);
            process.exitCode = await asc.main(args);
            args.pop(), args.pop();
            let sourcePath = process.argv[2];
            if (sourcePath) {
                console.log("Build progressing. Generating target files ······")
                let dirname = path.dirname(sourcePath);
                let targetName = sourcePath.split("/").slice(-1)[0].replace(/.ts$/, '')
                let wasmPath = path.join(dirname, "target", `${targetName}.wasm`);
                let wastPath = path.join(dirname, "target", `${targetName}.wast`);
                args.push("-o", wasmPath)
                args.push("-t", wastPath)
                let apiOption = new APIOptionImpl();
                try {
                    process.exitCode = await asc.main(args, apiOption);
                } catch(e) {
                    throw e
                } finally {
                    apiOption.writeExtensionFile();
                }
                console.log(`Build Done. Targets generated. Target directory: ${path.join(dirname, "target")}.`);
            }
            process.exit(process.exitCode);
        } else {
            console.log('usage: as-contract gencode [input file] -o [output dir]');
            console.log('       as-contract build [input file] --target [release/debug]');
            process.exit(1);
        }
    }
}
