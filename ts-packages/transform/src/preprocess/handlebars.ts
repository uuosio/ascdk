import Handlebars from "handlebars";
import { CONFIG } from "../config/compile";
import { FieldDef, ParameterNodeDef, ActionFunctionDef, DBIndexFunctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { EosioUtils } from "../utils/utils";

const WIN = process.platform === "win32";
const EOL = WIN ? "\r\n" : "\n";

let scope = CONFIG.scope;

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
        let plainType = field.type.plainTypeNode;
        console.log(`++++++++plainType:${plainType}, ${field.name}`)
        let numType = numberTypeMap.get(plainType.replace('[]', ''));
        if (numType) {
            code.push(`enc.packNumberArray<${numType}>(this.${field.name})`)
        }
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`enc.packNumber<${numType}>(this.${field.name});`)
        } else if (plainType == 'boolean') {
            code.push(`enc.packNumber<u8>(<u8>this.${field.name});`)
        } else if (plainType == 'string') {
            code.push(`enc.packString(this.${field.name});`)
        } else {
            code.push(`enc.pack(this.${field.name});`)
        }
    }
    return code.join(EOL);
});

Handlebars.registerHelper("actionParameterDeserialize", function (field: ParameterNodeDef) {
    let code: string[] = [];
    if (field.type.typeKind == TypeKindEnum.ARRAY) {
        let plainType = field.type.plainTypeNode;
        console.log(`++++++++plainType:${plainType}, ${field.name}`)
        let numType = numberTypeMap.get(plainType.replace('[]', ''));
        if (numType) {
            code.push(`this.${field.name} = dec.unpackNumberArray<${numType}>();`)
        }
    } else if (field.type.typeKind == TypeKindEnum.MAP) {
    } else {
        let plainType = field.type.plainTypeNode;
        let numType = numberTypeMap.get(plainType);
        if (numType) {
            code.push(`this.${field.name} = dec.unpackNumber<${numType}>();`)
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
    code.push(`        args.unpack(actionData);`)
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
    let plainType = fn.getterPrototype!.returnType!.plainTypeNode;
    if (plainType == 'chain.U128') {
        plainType = 'U128';
    } else if (plainType == 'chain.U256') {
        plainType = 'U256';
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
    }

    code.push(`case ${fn._index}: {`);
    code.push(`                let _value = _chain.getSecondaryValue_${plainType}(value);`);
    code.push(`                this.${fn.getterPrototype!.declaration.name.text} = _value;`);
    code.push(`                break;`);
    code.push(`            }`);
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