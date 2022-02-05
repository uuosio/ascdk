import Handlebars from "./handlebars";
import { Range } from "assemblyscript";
import { ContractProgram} from "../contract/contract";
import { ActionFunctionDef } from "../contract/elementdef";

import { mainTpl, storeTpl, eventTpl, dynamicTpl, codecTpl, actionTpl, tableTpl} from "../tpl";
import { CONFIG } from "../config/compile";
import { EosioUtils, RangeUtil } from "../utils/utils"
import { ABI, ABIAction, ABIStruct, ABIStructField, ABITable } from "../abi/abi"
import { TypeHelper } from "../utils/typeutil"

export class ModifyPoint {
    range: Range;
    mode: ModifyType;
    code: string;

    constructor(range: Range, mode: ModifyType, code: string) {
        this.range = range;
        this.mode = mode;
        this.code = code;
    }
}

export enum ModifyType {
    REPLACE,
    INSERT,
    DELETE,
    TOP,
    APPEND
}
export class SourceModifier {
    modifyPoints: ModifyPoint[] = [];
    fileExtension: Map<string, string> = new Map();
    fileExtMap: Map<string, ModifyPoint[]> = new Map();
    entryDir = "";

    public addModifyPoint(point: ModifyPoint): void {
        this.modifyPoints.push(point);
    }
 
    public toModifyFileMap(): void {
        this.modifyPoints.forEach(item => {
            let path = item.range.source.normalizedPath;
            if (this.fileExtMap.has(path)) {
                this.fileExtMap.get(path)!.push(item);
            } else {
                this.fileExtMap.set(path, [item]);
            }
        });
    }
}


// Write text (also fallback)
export function getExtCodeInfo(contractInfo: ContractProgram): SourceModifier {
    let sourceModifier = new SourceModifier();
    if (!contractInfo.contract) {
        throw Error("Not found annotation @contract that indicate contract!");
    }
    const render = Handlebars.compile(mainTpl);
    const exportMain = render(contractInfo);

    contractInfo.contract.actionFuncDefs.forEach(item => {
        let msgFun = <ActionFunctionDef>item;
        if (msgFun.messageDecorator.mutates == "false") {
            let body = msgFun.bodyRange.toString();
            body = body.replace(/{/i, `{\n  ${CONFIG.scope}Storage.mode = ${CONFIG.scope}StoreMode.R;`);
            sourceModifier.addModifyPoint(new ModifyPoint(msgFun.bodyRange, ModifyType.REPLACE, body));
        }
    });
    sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.range.source.range, ModifyType.DELETE, 'export'));
    for (let index = 0; index < contractInfo.storages.length; index++) {
        let store = Handlebars.compile(storeTpl)(contractInfo.storages[index]);
        sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.storages[index].range, ModifyType.REPLACE, store));
    }
    contractInfo.events.forEach(event => {
        let code = Handlebars.compile(eventTpl)(event);
        sourceModifier.addModifyPoint(new ModifyPoint(event.range, ModifyType.REPLACE, code));
    });
    
    contractInfo.codecs.forEach(codec => {
        let code = Handlebars.compile(codecTpl)(codec);
        sourceModifier.addModifyPoint(new ModifyPoint(codec.range, ModifyType.REPLACE, code));
    });

    contractInfo.dynamics.forEach(dynamic => {
        let code = Handlebars.compile(dynamicTpl)(dynamic);
        sourceModifier.addModifyPoint(new ModifyPoint(dynamic.range, ModifyType.REPLACE, code));
    });

    contractInfo.contract.actionFuncDefs.forEach(message => {
        let code = Handlebars.compile(actionTpl)(message);
        sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.range, ModifyType.APPEND, code));
    });

    contractInfo.contract.actionFuncDefs.forEach(message => {
        let _message = <ActionFunctionDef>message;
        let actionName = _message.messageDecorator.actionName;
        if (!EosioUtils.isValidName(actionName)) {
            throw new Error(`Invalid action name: ${actionName}. Trace: ${RangeUtil.location(message.declaration.range)}`);
        }
    });

    contractInfo.tables.forEach(table => {
        let code = Handlebars.compile(tableTpl)(table);
        sourceModifier.addModifyPoint(new ModifyPoint(table.range, ModifyType.REPLACE, code));

    });

//    MessageDecoratorNodeDef
//    ActionFunctionDef
    sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.range, ModifyType.APPEND, exportMain));
    sourceModifier.toModifyFileMap();
    return sourceModifier;
}

export function getAbiInfo(programInfo: ContractProgram): string {
    let abi = new ABI();
    programInfo.contract.actionFuncDefs.forEach(func => {
        let actionName = (<ActionFunctionDef>func).messageDecorator.actionName;
        let action = new ABIAction(actionName, actionName);
        abi.actions.push(action);

        let abiStruct = new ABIStruct();
        abiStruct.name = actionName;
        abiStruct.base = "";
        func.parameters.forEach(parameter => {
            let field = new ABIStructField();
            field.name = parameter.name;
            let plainType = parameter.type.plainTypeNode;
            if (plainType.indexOf('chain.') == 0) {
                plainType = plainType.replace('chain.', '');
            }
            field.type = TypeHelper.primitiveToAbiMap.get(plainType)!;
            abiStruct.fields.push(field);
        });
        abi.structs.push(abiStruct);
    });
    return JSON.stringify(abi, null, 2);
}
