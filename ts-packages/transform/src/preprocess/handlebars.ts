import Handlebars from "handlebars";
import { CONFIG } from "../config/compile";
import { FieldDef, ParameterNodeDef, ActionFunctionDef, DBIndexFunctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { EosioUtils } from "../utils/utils";
import { TypeHelper } from "../utils/typeutil";
import { TableInterpreter, ClassInterpreter } from "../contract/classdef";
import { RangeUtil } from "../utils/utils";
import { NamedTypeNodeDef } from "../contract/typedef";
import { Range } from "assemblyscript";
import dedent from "ts-dedent"
import process from "process"

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

    if (fn.type.typeNode.isNullable) {
        plainType = plainType.split('|')[0].trim();
    }

    if (plainType == 'string') {
        code.push(`${fn.name}: string = "";`);
    } else if (plainType == 'string[]') {
        code.push(`${fn.name}: string[] = [];`);
    } else {
        if (TypeHelper.isPrimitiveType(fn.type.typeKind)) {
            code.push(`${fn.name}: ${plainType};`);
        } else {
            code.push(`${fn.name}!: ${plainType};`);
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("generateActionParam", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    let plainType = fn.type.plainTypeNode;

    if (plainType == 'string') {
        code.push(`${fn.name}: string = "",`);
    } else if (plainType == 'string[]') {
        code.push(`${fn.name}: string[] = [],`);
    } else {
        if (TypeHelper.isPrimitiveType(fn.type.typeKind)) {
            code.push(`${fn.name}: ${plainType} = 0,`);
        } else {
            if (fn.type.typeNode.isNullable) {
                if (plainType.indexOf('null') > 0) {
                    code.push(`${fn.name}: ${plainType} = null,`);
                } else {
                    code.push(`${fn.name}: ${plainType} | null = null,`);
                }
            } else {
                code.push(`${fn.name}: ${plainType} | null = null,`);
            }
        }
    }

    return code.join(EOL);
});

Handlebars.registerHelper("generateActionConstructor", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    code.push(`if(${fn.name}) this.${fn.name} = ${fn.name};`);
    return code.join(EOL);
});

function fieldSerialize(name: string, type: NamedTypeNodeDef, isActionParam: boolean) {
    let code: string[] = [];
    let pack_code = "";
    if (!isActionParam && type.typeNode.isNullable) {
        pack_code = dedent`\n
                if (!this.${name}) {
                    _chain.check(false, "${name} can not be null");
                }
        \n`;
        pack_code += '        ';
        name = name + "!"
    }

    if (type.typeKind == TypeKindEnum.ARRAY) {
        let plainType = type.plainTypeNode;
        if (type.typeNode.isNullable) {
            plainType = plainType.split('|')[0].trim();
        }
        if (plainType.indexOf('Array<') >= 0) {
            plainType = plainType.replace('Array<', '').replace('>', '');
        } else {
            plainType = plainType.replace('[]', '');
        }
        let numType = numberTypeMap.get(plainType.replace('[]', ''));
        if (numType) {
            pack_code += `enc.packNumberArray<${numType}>(this.${name})`;
        } else if (plainType == 'string') {
            pack_code += `enc.packStringArray(this.${name})`;
        } else {
            pack_code += `enc.packObjectArray(this.${name});`;
        }
    } else if (type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map type is not supported currently!Trace ${RangeUtil.location(type.typeNode.range)}`);
    } else {
        let plainType = type.plainTypeNode;
        if (type.typeNode.isNullable) {
            plainType = plainType.split('|')[0].trim();
        }
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            pack_code += `enc.packNumber<${numType}>(this.${name});`;
        } else if (plainType == 'boolean') {
            pack_code += `enc.packNumber<u8>(<u8>this.${name});`;
        } else if (plainType == 'string') {
            pack_code += `enc.packString(this.${name});`;
        } else {
            pack_code += `enc.pack(this.${name});`;
        }
    }
    return pack_code;
}

function fieldDeserialize(name: string, type: NamedTypeNodeDef) {
    let code: string[] = [];
    if (type.typeKind == TypeKindEnum.ARRAY) {
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
            code.push(`this.${name} = dec.unpackNumberArray<${numType}>();`);
        } else if (plainType == 'string' ) {
            code.push(`this.${name} = dec.unpackStringArray();`);
        } else {
            let exclamationMark = "";
            if (type.typeNode.isNullable) {
                exclamationMark = "!"
            }
            code.push(dedent`\n
            {
                let length = <i32>dec.unpackLength();
                this.${name} = new Array<${plainType}>(length)
                for (let i=0; i<length; i++) {
                    let obj = new ${plainType}();
                    this.${name}${exclamationMark}[i] = obj;
                    dec.unpack(obj);
                }
            }
        \n`);
        }
    } else if (type.typeKind == TypeKindEnum.MAP) {
        throw Error(`map is not supported currently!Trace: ${RangeUtil.location(type.typeNode.range)}`);
    } else {
        let plainType = type.plainTypeNode;
        if (type.typeNode.isNullable) {
            plainType = plainType.split('|')[0].trim();
        }
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`this.${name} = dec.unpackNumber<${numType}>();`);
        } else if (plainType == 'boolean') {
            code.push(`this.${name} = <boolean>dec.unpackNumber<u8>();`);
        } else if (plainType == 'string') {
            code.push(`this.${name} = dec.unpackString();`);
        } else {
            code.push(dedent`\n        
                {
                    let obj = new ${plainType}();
                    dec.unpack(obj);
                    this.${name} = obj;
                }
                `);
        }
    }
    return code.join(EOL);
}

function fieldGetSize(name: string, type: NamedTypeNodeDef, isActionParam: boolean) {
    let code = "";
    if (!isActionParam && type.typeNode.isNullable) {
        code = dedent`\n
            if (!this.${name}) {
                _chain.check(false, "${name} can not be null");
            }
    \n`+"        ";
        name = name + "!"
    }
    if (type.typeKind == TypeKindEnum.ARRAY) {
        code += `size += _chain.calcPackedVarUint32Length(this.${name}.length);`;
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
            code += `size += sizeof<${plainType}>()*this.${name}.length;`;
        } else if (plainType == 'string') {
            code += dedent`\n
                    for (let i=0; i<this.${name}.length; i++) {
                        size += _chain.Utils.calcPackedStringLength(this.${name}[i]);
                    }
            \n`;
        } else {
        code += dedent`\n
                    for (let i=0; i<this.${name}.length; i++) {
                        size += this.${name}[i].getSize();
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
            code += `size += _chain.Utils.calcPackedStringLength(this.${name});`;
        } else {
            code += `size += this.${name}.getSize();`;
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
    
    let serializeCode = fieldSerialize(field.name, field.type, false);

    return `
    if (this._index == ${field._index}) {
        ${serializeCode}
    }`;

});

Handlebars.registerHelper("variantDeserialize", function (field: FieldDef) {
    let deserializecode = fieldDeserialize(field.name, field.type);
    return `
    if (this._index == ${field._index}) {
        ${deserializecode}
    }`;
});

Handlebars.registerHelper("variantGetSize", function (field: FieldDef) {
    let getSize = fieldGetSize(field.name, field.type, false);
    return `
    if (this._index == ${field._index}) {
        ${getSize}
    }`;
});

Handlebars.registerHelper("variantNew", function (field: FieldDef) {
    let code: string[] = [];
    let plainType = field.type.plainTypeNode;
    if (field.type.typeNode.isNullable) {
        plainType = plainType.split('|')[0].trim();
    }
    if (plainType == 'string') {
        code.push(`
        if (isString<T>()) {
            obj._index = ${field._index};
            obj.${field.name} = ""
        }
        `);
    } else {
        if (TypeHelper.isNumberType(field.type.typeKind)) {
            code.push(`
        if (nameof<T>() == "${plainType}") {
            obj._index = ${field._index};
            obj.${field.name} = 0;
        }`);
        } else {
            code.push(`
        if (idof<${field.type.plainTypeNode}>() == id) {
            obj._index = ${field._index};
            obj.${field.name} = instantiate<${plainType}>();
        }`);
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("variantGet", function (field: FieldDef) {
    let code: string[] = [];
    code.push(`
    is${field.name}(): bool {
        return this._index == ${field._index};
    }`);

    let plainType = field.type.plainTypeNode;
    if (TypeHelper.isPrimitiveType(field.type.typeKind)) {
        code.push(`
    get${field.name}(): ${plainType} {
        _chain.check(this._index == ${field._index}, "wrong variant type");
        return this.${field.name};
    }`);
    } else {
        let exclamationMark = "";
        if (field.type.typeNode.isNullable) {
            exclamationMark = "!"
        }
        code.push(`
        get${field.name}(): ${plainType} {
            _chain.check(this._index == ${field._index}, "wrong variant type");
            return this.${field.name}${exclamationMark};
        }`);
    }
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

Handlebars.registerHelper("actionParameterSerialize", function (field: ParameterNodeDef) {
    return fieldSerialize(field.name, field.type, true);
});

Handlebars.registerHelper("actionParameterDeserialize", function (field: ParameterNodeDef) {
    return fieldDeserialize(field.name, field.type);
});

Handlebars.registerHelper("actionParameterGetSize", function (field: ParameterNodeDef) {
    return fieldGetSize(field.name, field.type, true);
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
            parameters.push(`args.${parameter.name}`, );
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
    // console.log("+++++++++getSecondaryValue:", fn._index);
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

    code.push(dedent`
        update${valueName}(idxIt: _chain.SecondaryIterator, value: ${plainType}, payer: Name): _chain.${dbClass} {
            let secValue = _chain.newSecondaryValue_${plainType}(value);
            this.idxUpdate(idxIt, secValue, payer);
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