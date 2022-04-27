"use strict";
exports.__esModule = true;
exports.APIOptionImpl = void 0;
const preprocess_1 = require("./preprocess");
const mkdirp = require("assemblyscript/cli/util/mkdirp");
const path = require("path");
const fs = require("fs");
const { CONFIG } = require("./config/compile");

const { EosioUtils } = require("./utils/utils");

function optimizeCode(code) {
    var codeSegments = [];
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

function modifySourceText(sourceText, point) {
    if (point.mode == preprocess_1.ModifyType.REPLACE) {
        var prefix = sourceText.substring(0, point.range.start);
        var suffix = sourceText.substring(point.range.end, sourceText.length);
        return prefix + point.code + suffix;
    } else if (point.mode == preprocess_1.ModifyType.APPEND) {
        return sourceText + point.code;
    } else if (point.mode == preprocess_1.ModifyType.TOP) {
        return point.code + sourceText;
    } else if (point.mode == preprocess_1.ModifyType.DELETE) {
        sourceText = sourceText.replaceAll(/export\s/g, " ");
        return sourceText;
    }
    return sourceText;
};

var APIOptionImpl = /** @class */ (function () {
    function APIOptionImpl() {
        this.checkAll = true;
    }
    APIOptionImpl.prototype.readFile = function (filename, baseDir) {
        var name = path.resolve(baseDir, filename);
        var text_1;
        try {
            text_1 = fs.readFileSync(name, "utf8");
        }
        catch (e) {
            // console.log(e);
            return null;
        }

        var sourceModifier = process.sourceModifier ? process.sourceModifier : new preprocess_1.SourceModifier();
        let relativePath = path.relative(baseDir, name).split("\\").join("/");

        // Transform library imports
        if (relativePath.indexOf('/as-chain/') === -1 && !sourceModifier.fileExtMap.has(relativePath)) {
            const alternativePath = relativePath.replace(/.*node_modules/, '~lib').replace('/assembly', '')
            if (sourceModifier.fileExtMap.has(alternativePath)) {
                relativePath = alternativePath
            }
        }
        
        // Look for path in source modifier
        if (sourceModifier.fileExtMap.has(relativePath)) {
            var extCodes = sourceModifier.fileExtMap.get(relativePath);
            extCodes.sort((a, b) => {
                if (a.mode != b.mode) return a.mode - b.mode;
                return (b.range.end - a.range.end); 
            }).forEach(function (item) {
                text_1 = modifySourceText(text_1, item);
            });
            let importLang = `import * as _chain from "as-chain";\n`;
            if (text_1.indexOf(importLang) < 0) {
                text_1 = importLang + text_1;
            }

            importLang = "";
            if (process.libPaths && text_1.indexOf("apply(") >= 0) {
                process.libPaths.forEach((value, key) => {
                    importLang += `import * as ${value} from '${key}';\n`
                });    
            }
            text_1 = importLang + text_1;
            text_1 = optimizeCode(text_1);
            sourceModifier.fileExtension.set(filename, text_1);
            // console.log(`The file ${filename} extension: ${text_1}`);
        }
        return text_1;

    };

    APIOptionImpl.prototype.writeExtensionFile = function (baseDir) {
        var sourceModifier = process.sourceModifier ? process.sourceModifier : new preprocess_1.SourceModifier();
        for (let [key, value] of sourceModifier.fileExtension) {
            baseDir = sourceModifier.entryDir;
            let filePath = path.join(baseDir, path.basename(key));
            if (!fs.existsSync(path.dirname(filePath))) mkdirp(path.dirname(filePath));
            fs.writeFileSync(filePath, value);
        }
    };

    APIOptionImpl.prototype.writeGeneratedFile = function (outputDir) {
        var sourceModifier = process.sourceModifier ? process.sourceModifier : new preprocess_1.SourceModifier();
        for (let [filePath, extCodes] of sourceModifier.fileExtMap) {
            if (filePath.startsWith("~lib")) {
                continue;
            }

            let filename = path.basename(filePath);
            let outputFile = path.join(outputDir, filename);

            var text_1;
            try {
                text_1 = fs.readFileSync(filePath, "utf8");
            } catch (e) {
                // console.log(e);
                return null;
            }
            extCodes.sort((a, b) => {
                if (a.mode != b.mode) return a.mode - b.mode;
                return (b.range.end - a.range.end); 
            }).forEach(function (item) {
                text_1 = modifySourceText(text_1, item);
            });
            let importLang = `import * as _chain from "as-chain";\n`;
            if (text_1.indexOf(importLang) < 0) {
                text_1 = importLang + text_1;
            }
            text_1 = optimizeCode(text_1);
            fs.writeFileSync(outputFile, text_1);
        }
    };

    return APIOptionImpl;
}());
exports.APIOptionImpl = APIOptionImpl;
