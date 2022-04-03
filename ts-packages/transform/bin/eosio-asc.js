#!/usr/bin/env ts-node-transpile-only

import path from "path"
import fs from "fs"
import child_process from "child_process"
// try { import("source-map-support").then(({ default }) => default.install())  } catch (e) { }

import asc from "assemblyscript/dist/asc.js"
import { APIOptionImpl } from "../dist/ascoption.js"
import { ContractTransform } from "../dist/index.js"

const main = async () => {
    const tailArgs = process.argv.indexOf("--");
    if (~tailArgs) {
        child_process.spawnSync(
            process.argv[0],
            process.argv.slice(tailArgs + 1).concat(
                process.argv.slice(1, tailArgs)
            ),
            { stdio: "inherit" }
        );
        return;
    }

    let sourcePath = process.argv[2];
    if (!sourcePath) {
        throw new Error("No source path")
    }
    const dirname = path.dirname(sourcePath);

    const ARGS = [
        "--initialMemory", "1",
        "--runtime", "stub",
        "--use", "abort= ",
        "-O2",
        "--disable", "mutable-globals",
        "--disable", "sign-extension",
        "--disable", "nontrapping-f2i",
        "--disable", "bulk-memory",
        "--transform", "eosio-asc/dist/index.js"
    ]

    const memoryStream = asc.createMemoryStream()
    const apiOptions = new APIOptionImpl({
      stdout: memoryStream,
      stderr: memoryStream,
      listFiles: () => [],
      transforms: [new ContractTransform()],
      writeFile: (filename, contents, baseDir) => fs.writeFileSync(path.join(baseDir, filename), contents)
    });

    const args = process.argv.slice(2).concat(ARGS);
    await asc.main(args);
    // console.log(stdout.toString());

    console.log("Build progressing. Generating target files ······")
    let targetName = sourcePath.split(path.sep).slice(-1)[0].replace(/.ts$/, '')
    let wasmPath = path.join(dirname, "target", `${targetName}.wasm`);
    let wastPath = path.join(dirname, "target", `${targetName}.wast`);

    // Remove Transforms
    apiOptions.transforms = []
    args.push("-b", wasmPath)
    args.push("-t", wastPath)

    const { stderr } = await asc.main(args, apiOptions);
    console.log('EORA' + stderr.toString());

    apiOptions.writeExtensionFile();
    console.log(`Build Done. Targets generated. Target directory: ${path.join(dirname, "target")}.`);
}

main()