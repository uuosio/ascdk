import Handlebars from "handlebars";
import { CONFIG } from "../config/compile";
import { FieldDef, ParameterNodeDef, ActionFunctionDef, DBIndexFunctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { EosioUtils } from "../utils/utils";
import { TypeHelper } from "../utils/typeutil";
import { TableInterpreter } from "../contract/classdef";
import { RangeUtil } from "../utils/utils";

import {
    Range,
} from "assemblyscript";

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

Handlebars.registerHelper("generateActionMember", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    let plainType = fn.type.plainTypeNode;
    if (plainType == 'string') {
        code.push(` ${fn.name}: string = "";`);
    } else if (plainType == 'string[]') {
        code.push(` ${fn.name}: string[] = [];`);
    } else {
        if (TypeHelper.isPrimitiveType(fn.type.typeKind)) {
            code.push(` ${fn.name}: ${plainType};`);
        } else {
            code.push(` ${fn.name}!: ${plainType};`);
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("generateActionParam", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    let plainType = fn.type.plainTypeNode;

    if (plainType == 'string') {
        code.push(` ${fn.name}: string = "",`);
    } else if (plainType == 'string[]') {
        code.push(` ${fn.name}: string[] = [],`);
    } else {
        if (TypeHelper.isPrimitiveType(fn.type.typeKind)) {
            code.push(` ${fn.name}: ${plainType} = 0,`);
        } else {
            code.push(` ${fn.name}: ${plainType} | null = null,`);
        }
    }

    return code.join(EOL);
});

Handlebars.registerHelper("generateActionConstructor", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    code.push(` if(${fn.name}) this.${fn.name} = ${fn.name};`);
    return code.join(EOL);
});

Handlebars.registerHelper("actionParameterSerialize", function (field: ParameterNodeDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
        let plainType = field.type.plainTypeNode;
        if (plainType.indexOf('Array<') >= 0) {
            plainType = plainType.replace('Array<', '').replace('>', '');
        } else {
            plainType = plainType.replace('[]', '');
        }
        console.log(`++++++++plainType:${plainType}, ${field.name}`);
        let numType = numberTypeMap.get(plainType.replace('[]', ''));
        if (numType) {
            code.push(`enc.packNumberArray<${numType}>(this.${field.name})`);
        } else if (plainType == 'string') {
            code.push(`enc.packStringArray(this.${field.name})`);
        } else {
            code.push(`enc.packObjectArray(this.${field.name});`);
        }
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map type does not supported currently!Trace ${RangeUtil.location(field.parameterNode.range)}`);
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`enc.packNumber<${numType}>(this.${field.name});`);
        } else if (plainType == 'boolean') {
            code.push(`enc.packNumber<u8>(<u8>this.${field.name});`);
        } else if (plainType == 'string') {
            code.push(`enc.packString(this.${field.name});`);
        } else {
            code.push(`enc.pack(this.${field.name});`);
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("actionParameterDeserialize", function (field: ParameterNodeDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
        let plainType = field.type.plainTypeNode;
        console.log(`++++++++plainType:${plainType}, ${field.name}`);
        if (plainType.indexOf('Array<') >= 0) {
            plainType = plainType.replace('Array<', '').replace('>', '');
        } else {
            plainType = plainType.replace('[]', '');
        }
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`this.${field.name} = dec.unpackNumberArray<${numType}>();`);
        } else if (plainType == 'string' ) {
            code.push(`this.${field.name} = dec.unpackStringArray();`);
        } else {
            code.push(`{
                let length = <i32>dec.unpackLength();
                this.${field.name} = new Array<${plainType}>(length)
                for (let i=0; i<length; i++) {
                    let obj = new ${plainType}();
                    this.${field.name}[i] = obj;
                    dec.unpack(obj);
                }
            }`);
        }
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map does not supported currently!Trace: ${RangeUtil.location(field.parameterNode.range)}`);
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`this.${field.name} = dec.unpackNumber<${numType}>();`);
        } else if (plainType == 'boolean') {
            code.push(`this.${field.name} = <boolean>dec.unpackNumber<u8>();`);
        } else if (plainType == 'string') {
            code.push(`this.${field.name} = dec.unpackString();`);
        } else {
            code.push(`this.${field.name} = new ${plainType}();`);
            code.push(`        dec.unpack(this.${field.name});`);
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("actionParameterGetSize", function (field: ParameterNodeDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
        code.push(`size += _chain.calcPackedVarUint32Length(this.${field.name}.length);`);
        let plainType = field.type.plainTypeNode;

        if (plainType.indexOf('Array<') >= 0) {
            plainType = plainType.replace('Array<', '').replace('>', '');
        } else {
            plainType = plainType.replace('[]', '');
        }

        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`        size += sizeof<${plainType}>()*this.${field.name}.length;`);
        } else if (plainType == 'string') {
            code.push(`
            for (let i=0; i<this.${field.name}.length; i++) {
                size += _chain.Utils.calcPackedStringLength(this.${field.name}[i]);
            }
            `);
        } else {
            code.push(`
            for (let i=0; i<this.${field.name}.length; i++) {
                size += this.${field.name}[i].getSize();
            }
            `);
        }
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map type does not supported currently!Trace ${RangeUtil.location(field.parameterNode.range)}`);
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`size += sizeof<${numType}>();`);
        } else if (plainType == 'string') {
            code.push(`size += _chain.Utils.calcPackedStringLength(this.${field.name});`);
        } else {
            code.push(`size += this.${field.name}.getSize();`);
        }
    }
    return code.join(EOL);
});

function handleAction(action: ActionFunctionDef): string {
    let code: string[] = [];

    let parameters: string[] = [];
    action.parameters.forEach(parameter => {
        parameters.push(`args.${parameter.name}`, );
    });
    let actionName = action.messageDecorator.actionName;
    let actionNameHex = EosioUtils.nameToHexString(actionName);
    code.push(`if (action == ${actionNameHex}) {//${actionName}`);
    code.push(`        let args = new ${action.methodName}Action();`);
    code.push(`        args.unpack(actionData);`);
    code.push(`        mycontract.${action.methodName}(${parameters.join(',')})`);
    code.push(`      }`);
    return code.join(EOL);
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

Handlebars.registerHelper("generategetPrimaryFunction", function (table: TableInterpreter) {
    let code: string[] = [];
    if (table.singleton) {
        code.push(
        `
        getPrimaryValue(): u64 {
            return _chain.Name.fromString("${table.tableName}").N;
        }
        `
        );
    } else {
        code.push(
            `
            getPrimaryValue(): u64 {
                return this.${table.primaryFuncDef!.getterPrototype!.declaration.name.text}
            }
            `
        );
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
    console.log("+++++++++getSecondaryValue:", fn._index);
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
    
    code.push(`
        get ${fn.getterPrototype!.declaration.name.text}DB(): _chain.${dbClass} {
            return <_chain.${dbClass}>this.idxdbs[${fn._index}];
        }
    `);
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