import { Transform } from "assemblyscript/dist/transform.js";
import { Program } from "assemblyscript/dist/assemblyscript.js";
import * as path from "path";
import process from "process"
import * as preprocess from "./preprocess/index.js";
import { getContractInfo } from "./contract/contract.js";
import * as fs from "fs"
export class ContractTransform extends Transform {
    afterInitialize(program: Program): void {
        let source = program.sources[0];
        // TODO: make sure the semantics
        for (const src of program.sources) {
            if (
                src.sourceKind === 1 &&
                src.simplePath !== "index-incremental"
            ) {
                source = src;
                break;
            }
        }
        const info = getContractInfo(program);
        const internalPath = info.contract.classPrototype.internalName.split('/')
        const internalFolder = internalPath.slice(0, internalPath.length - 2)
        const internalFile = internalPath[internalPath.length - 2]

        const abi = preprocess.getAbiInfo(info);
        const out = preprocess.getExtCodeInfo(info);

        const baseDir = path.join(...internalFolder, "target");
        out.entryDir = baseDir;
        process.sourceModifier = out;
        const abiPath = path.join(internalFolder.map((_: any) => '..').join(path.sep), '..', baseDir, `${internalFile}.abi`);
        console.log("++++++writeFile:", abiPath)
        fs.writeFileSync(path.join(baseDir, abiPath), abi)
        // this.writeFile(abiPath, abi, baseDir);
    }
}
