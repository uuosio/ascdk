import Handlebars from "./handlebars";
import { Range } from "assemblyscript";
import { ContractProgram} from "../contract/contract";
import { ActionFunctionDef } from "../contract/elementdef";

import {
    mainTpl,
    actionTpl,
    tableTpl,
    serializerTpl,
    optionalTpl,
    binaryExtensionTpl,
    variantTpl,
} from "../tpl";

import { CONFIG } from "../config/compile";
import { EosioUtils, RangeUtil } from "../utils/utils";

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
    // if (!contractInfo.contract) {
    //     throw Error("Not found annotation @contract that indicate contract!");
    // }
    if (contractInfo.contract) {
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

        if (!contractInfo.hasApplyFunc) {
            sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.range, ModifyType.APPEND, exportMain));
        }
    }

    contractInfo.tables.forEach(table => {
        if (table.no_codegen) {
            return;
        }
        let code = Handlebars.compile(tableTpl)(table);
        sourceModifier.addModifyPoint(new ModifyPoint(table.range, ModifyType.REPLACE, code));
    });

    contractInfo.serializers.forEach(s => {
        if (s.no_codegen) {
            return;
        }
        let code = Handlebars.compile(serializerTpl)(s);
        sourceModifier.addModifyPoint(new ModifyPoint(s.range, ModifyType.REPLACE, code));
    });

    contractInfo.optionals.forEach(s => {
        if (s.no_codegen) {
            return;
        }
        let code = Handlebars.compile(optionalTpl)(s);
        sourceModifier.addModifyPoint(new ModifyPoint(s.range, ModifyType.REPLACE, code));
    });

    contractInfo.binaryExtensions.forEach(s => {
        if (s.no_codegen) {
            return;
        }
        let code = Handlebars.compile(binaryExtensionTpl)(s);
        sourceModifier.addModifyPoint(new ModifyPoint(s.range, ModifyType.REPLACE, code));
    });

    contractInfo.variants.forEach(variant => {
        if (variant.no_codegen) {
            return;
        }
        let code = Handlebars.compile(variantTpl)(variant);
        sourceModifier.addModifyPoint(new ModifyPoint(variant.range, ModifyType.REPLACE, code));
    });

    sourceModifier.toModifyFileMap();
    return sourceModifier;
}

export function getAbiInfo(programInfo: ContractProgram): string {
    return programInfo.getAbiInfo();
}
