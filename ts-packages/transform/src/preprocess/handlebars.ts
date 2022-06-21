import Handlebars from "handlebars";
import { CONFIG } from "../config/compile";
import { FieldDef, ParameterNodeDef, ActionFunctionDef, DBIndexFunctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { EosioUtils } from "../utils/utils";
import { TypeHelper } from "../utils/typeutil";
import { TableInterpreter, ClassInterpreter } from "../contract/classdef";
import { RangeUtil } from "../utils/utils";
import { NamedTypeNodeDef } from "../contract/typedef";
import { Range, DecoratorNode } from "assemblyscript";

import { CommonFlags } from "assemblyscript";

import dedent from "ts-dedent"
import process from "process"

import { AstUtil } from "../utils/utils";
import * as path from 'path'

const WIN = process.platform === "win32";
const EOL = WIN ? "\r\n" : "\n";

let scope = CONFIG.scope;


const numberTypeMap: Map<string, string> = new Map([
    ["bool", "bool"],
    ["boolean", "boolean"],
    ["i8", "i8"],
    ["u8", "u8"],
    ["i16", "i16"],
    ["u16", "u16"],
    ["i32", "i32"],
    ["u32", "u32"],
    ["i64", "i64"],
    ["u64", "u64"],
    ["f32", "f32"],
    ["f64", "f64"]
]);

let nameSpaces: Map<string, string> = new Map([]);

class ClassInfo {
    path: string = "";
    name: string = "";
    alias: string = "";
}

function getClassInfoFromInnerName(name: string) {
    let info = new ClassInfo();

    info.name = path.parse(name).base

    info.path = path.dirname(name);
    if (!name.startsWith("~lib")) {
        info.path = path.relative(process.userEntryFilePath, info.path);
    }

    info.alias = path.parse(info.path).base;
    info.alias = info.alias.replace('.', '_');
    info.alias = `_${info.alias}`;
    return info;
}

function parseTypeName(tp: NamedTypeNodeDef, isActionType: boolean = false) {
    let plainType = tp.plainTypeNode;
    if (!tp.current) {
        return "";
    }
    
    if (tp.typeNode.isNullable) {
        plainType = plainType.split('|')[0].trim();
    }

    if (TypeHelper.isPrimitiveType(tp.typeKind)) {
        return plainType;
    }

    if (!tp.current.isAny(CommonFlags.EXPORT)) {
        return plainType;
    }
    
    if (!isActionType) {
        return plainType;
    }

    if (!process.libPaths) {
        process.libPaths = nameSpaces;
    }

    let name = tp.current!.internalName;
    if (name.startsWith("~lib")) {
        if (name.startsWith("~lib/as-chain")) {
            if (plainType.indexOf(".") < 0) {
                plainType = "_chain." + plainType;
            }
        } else {
            let info = getClassInfoFromInnerName(name);
            nameSpaces.set(`./${info.path}`, info.alias);
            plainType = `${info.alias}.${info.name}`;
        }
    } else {
        let info = getClassInfoFromInnerName(name);
        nameSpaces.set(`./${info.path}`, info.alias);
        plainType = `${info.alias}.${info.name}`;
    }

    return plainType;
}

function generateTypeName(tp: NamedTypeNodeDef, isActionType: boolean = false) {
    if (tp.typeKind == TypeKindEnum.ARRAY) {
        let typeArgName = parseTypeName(tp.typeArguments![0], isActionType);
        return `Array<${typeArgName}>`;
    } else {
        if (TypeHelper.isPrimitiveType(tp.typeKind)) {
            return tp.plainTypeNode;
        } else {
            return parseTypeName(tp, isActionType);
        }
    }
}

Handlebars.registerHelper("generateActionParam", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    let plainType = generateTypeName(fn.type, true);

    if (TypeHelper.isStringType(fn.type.typeKind)) {
        code.push(`public ${fn.name}: ${plainType} = "",`);
    } else if (TypeHelper.isNumberType(fn.type.typeKind)) {
        code.push(`public ${fn.name}: ${plainType} = 0,`);
    } else {
        code.push(`public ${fn.name}: ${plainType} | null = null,`);
    }
    return code.join(EOL);
});

Handlebars.registerHelper("generateActionConstructor", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    code.push(`if(${fn.name}) this.${fn.name} = ${fn.name};`);
    return code.join(EOL);
});

Handlebars.registerHelper("actionParameterSerialize", function (field: ParameterNodeDef) {
    let name;
    if (TypeHelper.isPrimitiveType(field.type.typeKind)) {
        name = field.name;
    } else {
        name = `${field.name}!`
    }
    return fieldSerialize(name, field.type, true);
});

Handlebars.registerHelper("actionParameterDeserialize", function (field: ParameterNodeDef) {
    let name;
    if (TypeHelper.isPrimitiveType(field.type.typeKind)) {
        name = field.name;
    } else {
        name = `${field.name}!`
    }
    return fieldDeserialize(name, field.type, true);
});

Handlebars.registerHelper("actionParameterGetSize", function (field: ParameterNodeDef) {
    let name;
    if (TypeHelper.isPrimitiveType(field.type.typeKind)) {
        name = field.name;
    } else {
        name = `${field.name}!`
    }
    return fieldGetSize(name, field.type, true);
});

function fieldSerialize(name: string, type: NamedTypeNodeDef, isActionParam: boolean, prefix: string="this.") {
    let code: string[] = [];
    let pack_code = "";
    if (!isActionParam && type.typeNode.isNullable) {
        pack_code = dedent`\n
                if (!${prefix}${name}) {
                    _chain.check(false, "${name} can not be null");
                }
        \n`;
        pack_code += '        ';
        name = name + "!"
    }

    if (type.typeKind == TypeKindEnum.ARRAY) {
        let plainType = generateTypeName(type.typeArguments![0], isActionParam);
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            pack_code += `enc.packNumberArray<${numType}>(${prefix}${name})`;
        } else if (plainType == 'string') {
            pack_code += `enc.packStringArray(${prefix}${name})`;
        } else {
            pack_code += `enc.packObjectArray(${prefix}${name});`;
        }
    } else if (type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map type is not supported currently!Trace ${RangeUtil.location(type.typeNode.range)}`);
    } else {
        let plainType = generateTypeName(type, isActionParam);
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            pack_code += `enc.packNumber<${numType}>(${prefix}${name});`;
        } else if (plainType == 'boolean') {
            pack_code += `enc.packNumber<u8>(<u8>${prefix}${name});`;
        } else if (plainType == 'string') {
            pack_code += `enc.packString(${prefix}${name});`;
        } else {
            pack_code += `enc.pack(${prefix}${name});`;
        }
    }
    return pack_code;
}

function fieldDeserialize(name: string, type: NamedTypeNodeDef, isActionParam: boolean=false, prefix: string="this.") {
    let code: string[] = [];
    if (type.typeKind == TypeKindEnum.ARRAY) {
        let plainType = generateTypeName(type.typeArguments![0], isActionParam);
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`${prefix}${name} = dec.unpackNumberArray<${numType}>();`);
        } else if (plainType == 'string' ) {
            code.push(`${prefix}${name} = dec.unpackStringArray();`);
        } else {
            let exclamationMark = "";
            if (type.typeNode.isNullable) {
                exclamationMark = "!"
            }
            code.push(dedent`\n
            {
                let length = <i32>dec.unpackLength();
                ${prefix}${name} = new Array<${plainType}>(length)
                for (let i=0; i<length; i++) {
                    let obj = new ${plainType}();
                    ${prefix}${name}${exclamationMark}[i] = obj;
                    dec.unpack(obj);
                }
            }
        \n`);
        }
    } else if (type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map is not supported currently!Trace: ${RangeUtil.location(type.typeNode.range)}`);
    } else {
        let plainType = generateTypeName(type, isActionParam);
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`${prefix}${name} = dec.unpackNumber<${numType}>();`);
        } else if (plainType == 'boolean') {
            code.push(`${prefix}${name} = <boolean>dec.unpackNumber<u8>();`);
        } else if (plainType == 'string') {
            code.push(`${prefix}${name} = dec.unpackString();`);
        } else {
            code.push(dedent`\n        
                {
                    let obj = new ${plainType}();
                    dec.unpack(obj);
                    ${prefix}${name} = obj;
                }
                `);
        }
    }
    return code.join(EOL);
}

function fieldGetSize(name: string, type: NamedTypeNodeDef, isActionParam: boolean, prefix: string="this.") {
    let code = "";
    if (!isActionParam && type.typeNode.isNullable) {
        code = dedent`\n
            if (!${prefix}${name}) {
                _chain.check(false, "${name} can not be null");
            }
    \n`+"        ";
        name = name + "!"
    }
    if (type.typeKind == TypeKindEnum.ARRAY) {
        code += `size += _chain.calcPackedVarUint32Length(${prefix}${name}.length);`;
        let plainType = type.plainTypeNode;
        if (type.typeNode.isNullable) {
            plainType = plainType.split('|')[0].trim();
        }

        if (plainType.indexOf('Array<') >= 0) {
            plainType = plainType.replace('Array<', '').replace('>', '');
        } else {
            plainType = plainType.replace('[]', '');
        }

        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code += `size += sizeof<${plainType}>()*${prefix}${name}.length;`;
        } else if (plainType == 'string') {
            code += dedent`\n
                    for (let i=0; i<${prefix}${name}.length; i++) {
                        size += _chain.Utils.calcPackedStringLength(${prefix}${name}[i]);
                    }
            \n`;
        } else {
        code += dedent`\n
                    for (let i=0; i<${prefix}${name}.length; i++) {
                        size += ${prefix}${name}[i].getSize();
                    }
            \n`;
        }
    } else if (type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map type is not supported currently!Trace ${RangeUtil.location(type.typeNode.range)}`);
    } else {
        let plainType = type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code += `size += sizeof<${numType}>();`;
        } else if (plainType == 'string') {
            code += `size += _chain.Utils.calcPackedStringLength(${prefix}${name});`;
        } else {
            code += `size += ${prefix}${name}.getSize();`;
        }
    }
    return code;
}

Handlebars.registerHelper("optionalSerialize", function (field: FieldDef) {
    let code = `
        if (this.${field.name}) {
            enc.packNumber<u8>(1);
        } else {
            enc.packNumber<u8>(0);
            return enc.getBytes();
        }
    `;
    return code + fieldSerialize(field.name, field.type, false);
});

Handlebars.registerHelper("optionalDeserialize", function (field: FieldDef) {
    let code = `
        let hasValue = dec.unpackNumber<u8>();
        if (hasValue == 0) {
            this.${field.name} = null;
            return 1;
        }
    `;
    return code + fieldDeserialize(field.name, field.type);
});

Handlebars.registerHelper("optionalGetSize", function (field: FieldDef) {
    let code = `
        if (!this.${field.name}) {
            return 1;
        }
        size += 1;
    `;
    return code + fieldGetSize(field.name, field.type, false);
});

Handlebars.registerHelper("variantSerialize", function (field: FieldDef) {
    let code;
    let plainType = field.type.plainTypeNode;
    
    let serializeCode = fieldSerialize("value.value", field.type, false, "");

    return dedent`if (this._index == ${field._index}) {
                let value = changetype<_chain.VariantValue<${plainType}>>(this.value);
                ${serializeCode}
            }
    \n`;
});

Handlebars.registerHelper("variantDeserialize", function (field: FieldDef) {
    let plainType = field.type.plainTypeNode;
    let deserializecode = fieldDeserialize("innerValue", field.type, false, "");

    return dedent`if (this._index == ${field._index}) {
                let innerValue: ${plainType};
                ${deserializecode}
                let value = new _chain.VariantValue<${plainType}>(innerValue);
                this.value = changetype<usize>(value);
            }
    \n`;
});

Handlebars.registerHelper("variantGetSize", function (field: FieldDef) {
    let plainType = field.type.plainTypeNode;
    let getSize = fieldGetSize("value.value", field.type, false, "");
    return dedent`if (this._index == ${field._index}) {
                let value = changetype<_chain.VariantValue<${plainType}>>(this.value);
                ${getSize}
            }
    \n`;
});

Handlebars.registerHelper("variantNew", function (field: FieldDef) {
    let code: string[] = [];
    let plainType = field.type.plainTypeNode;
    if (field.type.typeNode.isNullable) {
        plainType = plainType.split('|')[0].trim();
    }
    code.push(dedent`if (idof<_chain.VariantValue<T>>() == idof<_chain.VariantValue<${plainType}>>()) {
                obj._index = ${field._index};
            }
    \n`);
    return code.join(EOL);
});

Handlebars.registerHelper("variantGet", function (field: FieldDef) {
    let code: string[] = [];
    code.push(dedent`\n
        is${field.name}(): bool {
            return this._index == ${field._index};
        }
    \n`);

    let plainType = field.type.plainTypeNode;
    if (TypeHelper.isPrimitiveType(field.type.typeKind)) {
        code.push(dedent`\n
            get${field.name}(): ${plainType} {
                _chain.check(this._index == ${field._index}, "wrong variant type");
                let value = changetype<_chain.VariantValue<${plainType}>>(this.value);
                return value.value;
            }
        \n`);
    } else {
        code.push(dedent`\n
            get${field.name}(): ${plainType} {
                _chain.check(this._index == ${field._index}, "wrong variant type");
                let value = changetype<_chain.VariantValue<${plainType}>>(this.value);
                return value.value;
            }
        \n`);
    }
    return code.join(EOL);
});

Handlebars.registerHelper("variantGenericGet", function (field: FieldDef) {
    let code: string[] = [];
    let plainType = field.type.plainTypeNode;
    code.push(dedent`\n
            if (idof<_chain.VariantValue<T>>() == idof<_chain.VariantValue<${plainType}>>()) {
                _chain.check(this._index == ${field._index}, "wrong variant type");
            }
    \n`);
    return code.join(EOL);
});

Handlebars.registerHelper("variantGenericIs", function (field: FieldDef) {
    let code: string[] = [];
    let plainType = field.type.plainTypeNode;
    code.push(dedent`\n
            if (idof<_chain.VariantValue<T>>() == idof<_chain.VariantValue<${plainType}>>()) {
                return this._index == ${field._index};
            }
    \n`);
    return code.join(EOL);
});

Handlebars.registerHelper("binaryExtensionSerialize", function (field: FieldDef) {
    let code = `
        if (this.${field.name}) {
            enc.packNumber<u8>(1);
        } else {
            enc.packNumber<u8>(0);
            return enc.getBytes();
        }
    `;
    return code + fieldSerialize(field.name, field.type, false);
});

Handlebars.registerHelper("binaryExtensionDeserialize", function (field: FieldDef) {
    let code = `
        if (dec.isEnd()) {
            return 0;
        }
    `;
    return code + fieldDeserialize(field.name, field.type);
});

Handlebars.registerHelper("binaryExtensionGetSize", function (field: FieldDef) {
    let code = `
        if (!this.${field.name}) {
            return 0;
        }
    `;
    return code + fieldGetSize(field.name, field.type, false);
});

Handlebars.registerHelper("serializerParameterSerialize", function (field: ParameterNodeDef) {
    return fieldSerialize(field.name, field.type, false);
});

Handlebars.registerHelper("serializerParameterDeserialize", function (field: ParameterNodeDef) {
    return fieldDeserialize(field.name, field.type);
});

Handlebars.registerHelper("serializerParameterGetSize", function (field: ParameterNodeDef) {
    return fieldGetSize(field.name, field.type, false);
});

function handleAction(action: ActionFunctionDef): string {
    let parameters: string[] = [];
    let unpackCode = '';
    if (action.messageDecorator.ignore) {
        action.parameters.forEach(parameter => {
            if (TypeHelper.isStringType(parameter.type.typeKind)) {
                parameters.push(`""`, );
            } else if (TypeHelper.isNumberType(parameter.type.typeKind)) {
                parameters.push(`0`, );
            } else {
                parameters.push(`null`, );
            }
        });
    } else {
        action.parameters.forEach(parameter => {
            if (TypeHelper.isPrimitiveType(parameter.type.typeKind)) {
                parameters.push(`args.${parameter.name}`, );
            } else {
                parameters.push(`args.${parameter.name}!`, );
            }
        });
        unpackCode = "args.unpack(actionData);"
    }

    let actionName = action.messageDecorator.actionName;
    let actionNameHex = EosioUtils.nameToHexString(actionName);

    return dedent`
        if (action == ${actionNameHex}) {//${actionName}
                    let args = new ${action.methodName}Action();
                    ${unpackCode}
                    mycontract.${action.methodName}(${parameters.join(',')})
                }
    `;
}

Handlebars.registerHelper("handleAction", function (action: ActionFunctionDef) {
    if (action.messageDecorator.notify) {
        return;
    }
    return handleAction(action);
});

Handlebars.registerHelper("handleNotifyAction", function (action: ActionFunctionDef) {
    if (!action.messageDecorator.notify) {
        return;
    }
    return handleAction(action);
});

Handlebars.registerHelper("getPrimaryValue", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    code.push(`${fn.getterPrototype?.rangeString}`);
    return code.join('');
});

Handlebars.registerHelper("ExtractClassBody", function (range: Range) {
    let src = range.toString().replace(/super\(\);?/, '');
    let start = src.indexOf('{');
    let end = src.lastIndexOf('}');
    return src.substring(start+1, end-1);
});


Handlebars.registerHelper("generateDecorator", function (decorator: DecoratorNode | null) {
    if (!decorator) {
        return "";
    }

    if (!decorator.args) {
        return `${decorator.name.range.toString()}(nocodegen)`;
    }

    let found = decorator.args.find(x => {
        return "nocodegen" == AstUtil.getIdentifier(x);
    });

    if (found) {
        return decorator.range.toString();
    }

    return decorator.range.toString().replace(")", ", nocodegen)");
});

Handlebars.registerHelper("generategetPrimaryFunction", function (table: TableInterpreter) {
    let code: string[] = [];
    if (table.singleton) {
        code.push(dedent`
            getPrimaryValue(): u64 {
                    return _chain.Name.fromString("${table.tableName}").N;
                }
        `);
    } else {
        if (!table.primaryFuncDef) {
            throw Error(`primary index declaration not found!Trace ${RangeUtil.location(table.range)}`);
        }
        code.push(dedent`
            getPrimaryValue(): u64 {
                    return this.${table.primaryFuncDef!.getterPrototype!.declaration.name.text}
                }
        `);
    }
    return code.join(EOL);
});

Handlebars.registerHelper("getSecondaryValue", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType!.plainTypeNode;
    if (plainType == 'chain.U128') {
        plainType = 'U128';
    } else if (plainType == 'chain.U256') {
        plainType = 'U256';
    }  else if (plainType == 'chain.Float128') {
        plainType = 'Float128';
    }

    code.push(`case ${fn._index}: {`);
    code.push(`                return _chain.newSecondaryValue_${plainType}(this.${fn.setterPrototype!.declaration.name.text});`);
    code.push(`                break;`);
    code.push(`            }`);
    return code.join(EOL);
});

Handlebars.registerHelper("setSecondaryValue", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType!.plainTypeNode;
    if (plainType == 'chain.U128') {
        plainType = 'U128';
    } else if (plainType == 'chain.U256') {
        plainType = 'U256';
    }  else if (plainType == 'chain.Float128') {
        plainType = 'Float128';
    }

    code.push(`case ${fn._index}: {`);
    code.push(`                let _value = _chain.getSecondaryValue_${plainType}(value);`);
    code.push(`                this.${fn.getterPrototype!.declaration.name.text} = _value;`);
    code.push(`                break;`);
    code.push(`            }`);
    return code.join(EOL);
});

const dbTypeToDBClass: Map<string, string> = new Map([
    ['U64', 'IDX64'],
    ['U128', 'IDX128'],
    ['U256', 'IDX256'],
    ['F64', 'IDXF64'],
    ['FLOAT128', 'IDXF128'],
]);

Handlebars.registerHelper("newSecondaryDB", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType!.plainTypeNode;
    if (plainType == 'chain.U128') {
        plainType = 'U128';
    } else if (plainType == 'chain.U256') {
        plainType = 'U256';
    } else if (plainType == 'chain.Float128') {
        plainType = 'Float128';
    }

    plainType = plainType.toUpperCase();
    let dbClass = dbTypeToDBClass.get(plainType);
    if (!dbClass) {
        throw Error(`unknown index type!Trace ${RangeUtil.location(fn.bodyRange)}`);
    }
    code.push(`new _chain.${dbClass}(code.N, scope.N, idxTableBase + ${fn._index}, ${fn._index}),`);
    return code.join(EOL);
});

Handlebars.registerHelper("generateGetIdxDBFunction", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType!.plainTypeNode;
    if (plainType == 'chain.U128') {
        plainType = 'U128';
    } else if (plainType == 'chain.U256') {
        plainType = 'U256';
    } else if (plainType == 'chain.Float128') {
        plainType = 'Float128';
    }

    plainType = plainType.toUpperCase();
    let dbClass = dbTypeToDBClass.get(plainType);
    
    code.push(dedent`
        get ${fn.getterPrototype!.declaration.name.text}DB(): _chain.${dbClass} {
                return <_chain.${dbClass}>this.idxdbs[${fn._index}];
            }
    `);
    return code.join(EOL);
});

Handlebars.registerHelper("generateSetIdxDBValueFunction", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType!.plainTypeNode;
    if (plainType == 'chain.U128') {
        plainType = 'U128';
    } else if (plainType == 'chain.U256') {
        plainType = 'U256';
    } else if (plainType == 'chain.Float128') {
        plainType = 'Float128';
    }

    let dbClass = dbTypeToDBClass.get(plainType.toUpperCase());
    
    let getter = fn.getterPrototype!.declaration.name.text;
    let valueName = getter.charAt(0).toUpperCase();
    valueName += getter.slice(1);

    code.push(dedent`\n
        update${valueName}(idxIt: _chain.SecondaryIterator, value: ${plainType}, payer: Name): void {
            let secValue = _chain.newSecondaryValue_${plainType}(value);
            this.idxUpdate(idxIt, secValue, payer);
        }
    \n`);
    return code.join(EOL);
});

/**
 * Register the tag of each.
 */
Handlebars.registerHelper("each", function (context, options) {
    var ret = "";
    for (var i = 0, j = context.length; i < j; i++) {
        let data = context[i];
        data._index = i;
        data.isMid = (i != j - 1 || (i == 0 && j != 1));
        ret = ret + options.fn(data);
    }
    return ret;
});

/**
 * Register the tag of equal
 */
Handlebars.registerHelper("eq", function (v1, v2, options) {
    if (v1 == v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

/**
 * Register the tag of neq (Not equal)
 */
Handlebars.registerHelper("neq", function (v1, v2, options) {
    if (v1 != v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

export default Handlebars;