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
    "--initialMemory", "1",
    "--runtime", "stub",
    "--use", "abort= ",
    "-O2",
    "--disable", "mutable-globals",
    "--disable", "sign-extension",
    "--disable", "nontrapping-f2i",
    "--disable", "bulk-memory",
    "--transform", "eosio-asc/index.ts"
]

if (true) {
    console.log("Build Starting ······")
    asc.ready.then(() => {
        let args = require('yargs').argv;
        if (args['_'] && args['_'][0] == "gencode") {
            let inputFile = args['_'][1];
            let outputDir = args['o'];
            args = args['_'].slice(1).concat(ARGS);
            process.exitCode = asc.main(args);
            const ascOption = require("eosio-asc/src/ascoption.js");
            let apiOption = new ascOption.APIOptionImpl();
            apiOption.writeGeneratedFile(outputDir);
            return;
        }

        args = process.argv.slice(2).concat(ARGS);
        process.exitCode = asc.main(args);
        // if (process.exitCode != 0) {
        //     return process.exitCode;
        // }
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
                try {
                    process.exitCode = asc.main(args, apiOption);
                } catch(e) {
                    throw e
                } finally {
                    apiOption.writeExtensionFile();
                }
                console.log(`Build Done. Targets generated. Target directory: ${path.join(dirname, "target")}.`);
            }
        });
        return process.exitCode
    });
}