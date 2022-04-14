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

    // Add missing functions
    const fullList = ["U128", "U256", "I128", "Float128", "VarInt32", "VarUint32", "calcPackedVarUint32Length", "DBI64", "PrimaryIterator", "IDX64", "IDXF64", "IDXF128", "IDX128", "IDX256", "VariantValue", "assert", "check", "currentTimePoint", "currentTime", "currentTimeMs", "currentTimeSec", "Microseconds", "TimePoint", "TimePointSec", "BlockTimestamp", "prints", "printui", "print", "printString", "printArray", "printHex", "printi", "printI128", "printU128", "printsf", "printdf", "printqf", "printn", "IDXDB", "SecondaryType", "SecondaryValue", "SecondaryIterator", "newSecondaryValue_u64", "newSecondaryValue_U128", "newSecondaryValue_U256", "newSecondaryValue_f64", "newSecondaryValue_Float128", "getSecondaryValue_u64", "getSecondaryValue_U128", "getSecondaryValue_U256", "getSecondaryValue_f64", "getSecondaryValue_Float128", "MultiIndex", "MultiIndexValue", "SAME_PAYER", "Singleton", "Contract", "ActionWrapper", "Table", "InlineAction", "Variant", "getSender", "readActionData", "unpackActionData", "actionDataSize", "requireRecipient", "requireAuth", "hasAuth", "requireAuth2", "isAccount", "publicationTime", "currentReceiver", "Name", "Action", "PermissionLevel", "Asset", "ExtendedAsset", "Symbol", "ExtendedSymbol", "isValid", "sendDeferred", "cancelDeferred", "readTransaction", "transactionSize", "    taposBlockNum", "taposBlockPrefix", "transactionExpiration", "getAction", "getContextFreeData", "TransactionExtension", "Transaction", "PublicKey", "Signature", "Checksum160", "Checksum256", "Checksum512", "recoverKey", "assertRecoverKey", "assertSha256", "assertSha1", "assertSha512", "assertRipemd160", "sha256", "sha1", "sha512", "ripemd160", "Packer", "Encoder", "Decoder", "Utils"]
    const imports = code.match(/^(\s+)?import.*?.('|").*?('|")/gms)
    const extractImports = (imp) => imp.split('{')[1].split('}')[0].split(',').map(_ => _.trim())
    const allImports = imports.reduce((acc, imp) => ~imp.indexOf('{') ? acc.concat(extractImports(imp)) : acc, [])
    const missingImports = fullList.filter(_ => !allImports.includes(_))
    if (missingImports.length) {
        code = `import { ${missingImports.join(', ')} } from "as-chain"\n` + code
    }
    
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
        if (sourceModifier.fileExtMap.has(relativePath)) {
            var extCodes = sourceModifier.fileExtMap.get(relativePath);
            extCodes.sort((a, b) => {
                if (a.mode != b.mode) return a.mode - b.mode;
                return (b.range.end - a.range.end); 
            }).forEach(function (item) {
                text_1 = modifySourceText(text_1, item);
            });
            let importLang = `import * as _chain from "as-chain";\n`;
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

    return APIOptionImpl;
}());
exports.APIOptionImpl = APIOptionImpl;
