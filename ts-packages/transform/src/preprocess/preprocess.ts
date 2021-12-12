import Handlebars from "./handlebarsbiz";
import { Range } from "assemblyscript";
import { ContractProgram} from "../contract/contract";
import { blake2AsHex } from "@polkadot/util-crypto";

import { mainTpl, storeTpl, eventTpl, dynamicTpl, codecTpl, storeFieldTpl, storeCommitTpl} from "../tpl/tpl";
import { IContractMetadata } from "pl-contract-metadata/dist/specs";

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
    INSERT, // INSERT
    REPLACE, // 替换
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
 
    public genModifyFileMap(): void {
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

    sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.range.source.range, ModifyType.DELETE, 'export'));
    
    let store = Handlebars.compile(storeTpl)(contractInfo.contract);
    let storeCommit = Handlebars.compile(storeCommitTpl)(contractInfo.contract);
    sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.lastRange, ModifyType.INSERT, store + storeCommit));
    
    contractInfo.contract.storeFields.forEach(item => {
        let field = Handlebars.compile(storeFieldTpl)(item);
        sourceModifier.addModifyPoint(new ModifyPoint(item.range, ModifyType.REPLACE, field));
    });

    contractInfo.contract.parentContracts.forEach(item => {
        let store = Handlebars.compile(storeTpl)(item);
        let storeCommit = Handlebars.compile(storeCommitTpl)(item);
        sourceModifier.addModifyPoint(new ModifyPoint(item.lastRange, ModifyType.INSERT, store + storeCommit));
    });

    contractInfo.events.forEach(event => {
        let code = Handlebars.compile(eventTpl)(event);
        sourceModifier.addModifyPoint(new ModifyPoint(event.lastRange, ModifyType.INSERT, code));
    });
    
    contractInfo.codecs.forEach(codec => {
        let code = Handlebars.compile(codecTpl)(codec);
        sourceModifier.addModifyPoint(new ModifyPoint(codec.range, ModifyType.REPLACE, code));
    });

    contractInfo.dynamics.forEach(dynamic => {
        let code = Handlebars.compile(dynamicTpl)(dynamic);
        sourceModifier.addModifyPoint(new ModifyPoint(dynamic.range, ModifyType.REPLACE, code));
    });
    sourceModifier.addModifyPoint(new ModifyPoint(contractInfo.contract.range, ModifyType.APPEND, exportMain));
    sourceModifier.genModifyFileMap();
    return sourceModifier;
}

export function getAbiInfo(abiInfo: ContractProgram): IContractMetadata {
    return abiInfo.metatdata.toMetadata();
}

export function genHashcode(content: string): string {
    return blake2AsHex(content, 256);
}