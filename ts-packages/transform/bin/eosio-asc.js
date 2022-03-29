#!/usr/bin/env ts-node-transpile-only

const tailArgs = process.argv.indexOf("--");
if (~tailArgs) {
    require("child_process").spawnSync(
        process.argv[0],
        process.argv.slice(tailArgs + 1).concat(
            process.argv.slice(1, tailArgs)
        ),
        { stdio: "inherit" }
    );
    return;
}

try { require("source-map-support").install(); } catch (e) { }

const asc = module.exports = require("eosio-asc/src/asc/asc.js");
// const asc = module.exports = require("assemblyscript/cli/asc.js");
const path = require("path");
const ARGS = [
    // "--importMemory",
    "--initialMemory",
    "1",
    // "--maximumMemory",
    // "16",
    // "--noExportMemory",
    "--runtime",
    "stub",
    "--use",
    "abort= ",
    "-O2",
    "--transform",
    "eosio-asc/index.ts"
]

if (true) {
    console.log("Build Starting ······")
    asc.ready.then(() => {
        let args = process.argv.slice(2).concat(ARGS);
        console.log(args)
        process.exitCode = asc.main(args);
        if (process.exitCode != 0) {
            return process.exitCode;
        }
        asc.ready.then(()=> {
            args.pop(), args.pop();
            let sourcePath = process.argv[2];
            if (sourcePath) {
                console.log("Build progressing. Generating target files ······")
                let dirname = path.dirname(sourcePath);
                let targetName = sourcePath.split(path.sep).slice(-1)[0].replace(/.ts$/, '')
                let wasmPath = path.join(dirname, "target", `${targetName}.wasm`);
                let wastPath = path.join(dirname, "target", `${targetName}.wast`);
                args.push("-b", wasmPath)
                args.push("-t", wastPath)
                const ascOption = require("eosio-asc/src/ascoption.js");
                let apiOption = new ascOption.APIOptionImpl();
                process.exitCode = asc.main(args, apiOption);
                apiOption.writeExtensionFile();
                console.log(`Build Done. Targets generated. Target directory: ${path.join(dirname, "target")}.`);
            }
        });
        return process.exitCode
    });
}