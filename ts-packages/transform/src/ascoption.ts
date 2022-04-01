import { APIOptions } from "assemblyscript/dist/asc";
import { SourceModifier, ModifyPoint, ModifyType } from "./preprocess";
import { EosioUtils } from "./utils/utils";
import * as path from "path";
import * as fs from "fs";
import process from "process";

function optimizeCode(code) {
    var codeSegments: any[] = [];
    var index = 0;
    var segmentStart = 0;
    var segmentEnd = 0;
    var keyWord = "Name.fromString";
    do {
        index = code.indexOf(keyWord, index);
        if (index < 0) {
            break;
        }

        var start = code.indexOf('(', index);
        start += 1;
        var end = code.indexOf(')', start + 1);
        segmentEnd = end;

        var name = code.substring(start, end);
        start = name.indexOf('"');
        if (start >= 0) {
            end = name.indexOf('"', start+1);
        } else {
            start = name.indexOf("'", start);
            end = name.indexOf("'", start+1);
        }

        if (start < 0) {
            index += 1;
            continue;
        }

        name = name.substring(start + 1, end);
        name = EosioUtils.nameToHexString(name);
        codeSegments.push(code.substring(segmentStart, index));
        codeSegments.push(`Name.fromU64(${name})`);
        index = index + 1;
        segmentStart = segmentEnd + 1;
    } while (true);

    codeSegments.push(code.substring(segmentStart));
    code = codeSegments.join('');
    return code;
}

function modifySourceText(sourceText: string, point: ModifyPoint): string {
    // console.log("++++++++++ascoption.ts:modifySourceText:", point.code);
    if (point.mode == ModifyType.REPLACE) {
        var prefix = sourceText.substring(0, point.range.start);
        var suffix = sourceText.substring(point.range.end, sourceText.length);
        return prefix + point.code + suffix;
    } else if (point.mode == ModifyType.APPEND) {
        return sourceText + point.code;
    } else if (point.mode == ModifyType.TOP) {
        return point.code + sourceText;
    } else if (point.mode == ModifyType.DELETE) {
        sourceText = sourceText.replaceAll(/export\s/g, " ");
        return sourceText;
    }
    return sourceText;
}

let sources = {}
export class APIOptionImpl implements APIOptions {
    transforms = []
    sources = {}

    constructor (options: APIOptions & { sources?: { [key: string]: string  }}) {
        Object.assign(this, options);
    }

    readFile(filename: string, baseDir: string) : string | null {
        // console.log("++++++++++ascoption.ts:readFile:", filename, baseDir);
        let name = path.resolve(baseDir, filename);
        try {
            let text: string
            if (fs.readFileSync) {
                text = fs.readFileSync(name, "utf8")
            } else {
                if (Object.prototype.hasOwnProperty.call(sources, name)) {
                    text = sources[name]
                } else {
                    throw new Error('File not found')
                }
            }


            let sourceModifier = process.sourceModifier ? process.sourceModifier : new SourceModifier();
            let relativePath = path.relative(baseDir, name).split("\\").join("/");
            if (sourceModifier.fileExtMap.has(relativePath)) {
                let extCodes = sourceModifier.fileExtMap.get(relativePath);
                extCodes!.sort((a: ModifyPoint, b: ModifyPoint) => {
                    if (a.mode != b.mode) return a.mode - b.mode;
                    return (b.range.end - a.range.end); 
                }).forEach(item => {
                    // console.log("++++++point.code:", item.code);
                    text = modifySourceText(text, item);
                });

                let importLang = `import * as _chain from "as-chain";\n`;
                text = importLang + text;
                text = optimizeCode(text);
                sourceModifier.fileExtension.set(filename, text);
                // console.log(`The file ${filename} extension: ${text_1}`);
            }
            return text;
        } catch (e) {
            console.log(`Process file: ${filename} failed. Details: ${e}`);
            return null;
        }
    }

    writeExtensionFile (baseDir?: string) {
        var sourceModifier = process.sourceModifier ? process.sourceModifier : new SourceModifier();
        for (let [key, value] of sourceModifier.fileExtension) {
            baseDir = sourceModifier.entryDir;
            let filePath = path.join(baseDir || '', path.basename(key));
            sources[filePath] = value;
        }
    };

}