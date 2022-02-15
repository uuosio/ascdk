import Handlebars from "handlebars";
import { CONFIG } from "../config/compile";
import { ClassInterpreter, EventInterpreter } from "../contract/classdef";
import { FieldDef, FunctionDef, ParameterNodeDef, ActionFunctionDef, DBIndexFunctionDef } from "../contract/elementdef";
import { NamedTypeNodeDef } from "../contract/typedef";
import { TypeKindEnum } from "../enums/customtype";
import { TypeHelper } from "../utils/typeutil";
import { EosioUtils } from "../utils/utils";
import { KeySelector } from "./selector";

const WIN = process.platform === "win32";
const EOL = WIN ? "\r\n" : "\n";

let scope = CONFIG.scope;

function convertToCodec(typeNode: NamedTypeNodeDef, varname: string): string {
    if (!typeNode.isCodec && typeNode.typeKind == TypeKindEnum.NUMBER) {
        return `new ${scope}${typeNode.codecType}(${varname})`;
    } else if (!typeNode.isCodec && typeNode.typeKind == TypeKindEnum.STRING) {
        return `new ${scope}${typeNode.codecType}(${varname})`;
    }  else if (!typeNode.isCodec && typeNode.typeKind == TypeKindEnum.BIG_NUM) {
        return `new ${scope}${typeNode.codecType}(${varname})`;
    } else {
        return `${varname}`;
    }
}

function createDefaultCodec(typeNode: NamedTypeNodeDef): string {
    if (typeNode.typeKind == TypeKindEnum.NUMBER) {
        return `new ${typeNode.getNameSpace()}${typeNode.codecType}()`;
    } else if (typeNode.typeKind == TypeKindEnum.STRING) {
        return `new ${typeNode.getNameSpace()}${typeNode.codecType}()`;
    } else if (typeNode.typeKind == TypeKindEnum.BIG_NUM) {
        return `new ${typeNode.getNameSpace()}${typeNode.codecType}()`;
    } else {
        return `new ${typeNode.getNameSpace()}${typeNode.codecType}()`;
    }
}

function toTypeValue(type: NamedTypeNodeDef, varname: string): string {
    if (type.isCodec) {
        return varname;
    }
    if (type.typeKind == TypeKindEnum.NUMBER || type.typeKind == TypeKindEnum.BIG_NUM) {
        return `${varname}.unwrap();`;
    } else if (type.typeKind == TypeKindEnum.STRING) {
        return `${varname}.toString();`;
    } else {
        return `${varname}`;
    }
}

function convertBytesToType(typeNode: NamedTypeNodeDef | null) {
    if (!typeNode) {
        return "";
    }
    let code: string[] = [];
    if (!typeNode.isCodec && typeNode.typeKind == TypeKindEnum.NUMBER) {
        code.push(`return ${scope}BytesReader.decodeInto<${scope}${typeNode.codecType}>(rs).unwrap();`);
    }
    if (!typeNode.isCodec && typeNode.typeKind == TypeKindEnum.STRING) {
        code.push(`return ${scope}BytesReader.decodeInto<${scope}${typeNode.codecType}>(rs).toString();`);
    }
    return code.join(EOL);
}

Handlebars.registerHelper("genClassToU8", function (classDef: ClassInterpreter) {
    let code: string[] = [];
    code.push(`   let bytes = new Array<u8>();`);
    for (let index = 0; index < classDef.fields.length; index ++) {
        let codecObj = convertToCodec(classDef.fields[index].type, `this.${classDef.fields[index].name}`);
        code.push(`  bytes = bytes.concat(${codecObj}.toU8a())`);
    }
    code.push(`     return bytes;`);
    return code.join(EOL);
});


Handlebars.registerHelper("genEncodedLength", function (classDef: ClassInterpreter) {
    let code: string[] = [];
    code.push(`   let length: i32 = 0;`);
    for (let index = 0; index < classDef.fields.length; index++) {
        let codecObj = convertToCodec(classDef.fields[index].type, `this.${classDef.fields[index].name}`);
        code.push(`  length += ${codecObj}.encodedLength();`);
    }
    code.push(`     return length;`);
    return code.join(EOL);
});


Handlebars.registerHelper("genPopulateFromBytes", function (classDef: ClassInterpreter) {
    let code: string[] = [];
    for (let index = 0; index < classDef.fields.length; index++) {
        let field = classDef.fields[index];
        code.push(`     let p${index} = ${createDefaultCodec(field.type)};`);
        code.push(`     p${index}.populateFromBytes(bytes, index);` );
        code.push(`     this.${field.name} = ${toTypeValue(field.type, `p${index}`)} ;`);
        code.push(`     index += p${index}.encodedLength();`);
    }
    return code.join(EOL);
});


Handlebars.registerHelper("genCodeEq", function (classDef: ClassInterpreter) {
    let code: string[] = [];
    let fields: string[] = [];
    code.push(` eq(other: ${classDef.className}): bool {`);

    for (let index = 0; index < classDef.fields.length; index++) {
        let field = classDef.fields[index];
        fields.push(` this.${field.name} == other.${field.name}`);
    }
    code.push(` return ${fields.join(" && ")};`);
    code.push("     }");
    return code.join(EOL);
});


Handlebars.registerHelper("wrapResult", function (typeNode: NamedTypeNodeDef) {
    return convertToCodec(typeNode, "rs");
});

Handlebars.registerHelper("toCodec", function (field: FieldDef) {
    return convertToCodec(field.type, `this.${field.name}`);
});

Handlebars.registerHelper("serialize", function (field: FieldDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        if (field.type.plainType == 'u32') {
            code.push(`enc.packNumber<u32>(this.${field.name})`)
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("deserialize", function (field: FieldDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        if (field.type.plainType == 'u32') {
            code.push(`this.${field.name} = dec.unpackNumber<u32>()`)
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("generateActionMember", function (fn: ParameterNodeDef) {
    let code: string[] = [];
    let plainType = fn.type.plainTypeNode
    if (plainType == 'string') {
        code.push(` ${fn.name}: string = "";`);
    } else {
        if (plainType.indexOf('chain.') == 0) {
            code.push(` ${fn.name}!: ${plainType};`);
        } else {
            code.push(` ${fn.name}: ${plainType};`);
        }
    }
    return code.join(EOL);
});

const numberTypeMap: Map<string, string> = new Map([
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

Handlebars.registerHelper("actionParameterSerialize", function (field: ParameterNodeDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`enc.packNumber<${numType}>(this.${field.name})`)
        } else if (plainType == 'boolean') {
            code.push(`enc.packNumber<u8>(<u8>this.${field.name})`)
        } else if (plainType == 'string') {
            code.push(`enc.packString(this.${field.name})`)
        } else {
            code.push(`enc.pack(this.${field.name})`)
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("actionParameterDeserialize", function (field: ParameterNodeDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`this.${field.name} = dec.unpackNumber<${numType}>()`)
        } else if (plainType == 'boolean') {
            code.push(`this.${field.name} = <boolean>dec.unpackNumber<u8>()`);
        } else if (plainType == 'string') {
            code.push(`this.${field.name} = dec.unpackString()`);
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
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`size += sizeof<${numType}>();`)
        } else if (plainType == 'string') {
            code.push(`size += _chain.Utils.calcPackedStringLength(this.${field.name});`)
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
        parameters.push(`args.${parameter.name}`, )
    })
    let actionName = action.messageDecorator.actionName;
    let actionNameHex = EosioUtils.nameToHexString(actionName);
    code.push(`if (action == ${actionNameHex}) {//${actionName}`)
    code.push(`        let args = new ${action.methodName}Action();`)
    code.push(`        args.deserialize(actionData);`)
    code.push(`        mycontract.${action.methodName}(${parameters.join(',')})`)
    code.push(`      }`)
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
//    code.push(`return this.${fn.getterPrototype?.declaration.name.text}`)
    code.push(`${fn.getterPrototype?.rangeString}`)
    return code.join('');
});

Handlebars.registerHelper("getSecondaryValue", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType.plainType;
    console.log("+++++++++getSecondaryValue:", fn._index);
    code.push(`case ${fn._index}: {`);
    code.push(`                return _chain.newSecondaryValue_${plainType}(fn.setterPrototype.declaration.name.text);`);
    code.push(`                break;`);
    code.push(`            }`);
    return code.join(EOL);
});

Handlebars.registerHelper("setSecondaryValue", function (fn: DBIndexFunctionDef) {
    let code: string[] = [];
    let plainType = fn.getterPrototype!.returnType.plainType;
    code.push(`case ${fn._index}: {`);
    code.push(`                let _value = _chain.getSecondaryValue_${plainType}(value);`);
    code.push(`                this.${fn.getterPrototype!.declaration.name.text} = _value;`);
    code.push(`                break;`);
    code.push(`            }`);
    return code.join(EOL);
});

/**
 *  set {{name}}(v: {{type.plainType}}) {
    this.{{varName}} = new {{type.codecTypeAlias}}(v);
    const st = new ${scope}Storage(new ${scope}Hash({{selector.u8Arr}}));
    st.store<{{type.codecTypeAlias}}>(this.{{varName}}!);
  }
 * 
 */
Handlebars.registerHelper("storeSetter", function (field: FieldDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY || field.type.typeKind == TypeKindEnum.MAP) {
        return code.join("\n");
    }
    code.push(`set ${field.name}(v: ${field.type.plainType}) {`);
    if (field.decorators.isIgnore) {
        if (field.type.isCodec || field.type.typeKind == TypeKindEnum.USER_CLASS) {
            code.push(`     this.${field.varName} = v;`);
        } else {
            code.push(`     this.${field.varName} = new ${field.type.codecTypeAlias}(v);`);
        }
        code.push(` }`);
    } else {
        if (field.type.isCodec || field.type.typeKind == TypeKindEnum.USER_CLASS) {
            code.push(`     this.${field.varName} = v;`);
        } else {
            code.push(`     this.${field.varName} = new ${field.type.codecTypeAlias}(v);`);
        }
        code.push(`     const st = new ${scope}Storage(new ${scope}Hash(${field.selector.hexArr}));`);
        code.push(`     st.store<${field.type.codecTypeAlias}>(this.${field.varName}!);`);
        code.push(` }`);
    }

    return code.join("\n");
});

/**
 * Event constructor
 *
 */
Handlebars.registerHelper("constructor", function(event: EventInterpreter) {
    if (event.constructorFun) {
        let body = event.constructorFun.declaration.range.toString();
        body = body.replace(/{/i, `{${EOL}        super();`);
        body = body.replace(/(.*)}/, `        this.emit();${EOL}  }`);
        return body;
    } else {
        let code: string[] =[];
        code.push(` constructor() {`);
        code.push(`     super();`);
        code.push(`     this.emit();`);
        code.push(`}`);
        return code.join(EOL);
    }
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
 * Register the tag of selector.
 */
Handlebars.registerHelper("selector", function (context, options) {
    // let data = context;
    let data = new KeySelector(context);
    return options.fn(data);
});

/**
 * Register the tag of join.
 */
Handlebars.registerHelper("joinParams", function (context) {
    var data: string[] = [];
    for (var i = 0, j = context.length; i < j; i++) {
        if (context[i].type.codecType == "ScaleString") {
            data.push("p" + i + ".toString()");
        } else if (context[i].type.typeKind == TypeKindEnum.USER_CLASS) {
            data.push("p" + i);
        } else {
            data.push("p" + i + ".unwrap()");
        }
    }
    return data.join(",");
});

Handlebars.registerHelper("generateFunction", function (fn: FunctionDef) {
    let funParams: string[] = [];
    let funVarious: string[] = [];
    for (let i = 0; i < fn.parameters.length; i++) {
        let param = fn.parameters[i];
        funParams.push(`p${i}: ${param.type.plainType}`);
        funVarious.push(convertToCodec(param.type, `p${i}`));
    }
    let code: string[] = [];
    code.push(`${ fn.methodName }(${ funParams.join(",") }): ${ fn.isReturnable ? fn.returnType?.plainType : "void" } {`);
    code.push(`     let data = ${CONFIG.scope}Abi.encode("${fn.methodName}", [${funVarious.join(",")}]);`);
    if (fn.isReturnable) {
        code.push(`         let rs = this.addr.call(data);`);
        code.push(`         ${convertBytesToType(fn.returnType)}`);
    } else {
        code.push(`         this.addr.call(data);`);
    }
    code.push(`     }`);
    return code.join(EOL);
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