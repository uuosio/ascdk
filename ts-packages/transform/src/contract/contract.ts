import {
    ClassPrototype,
    Program,
} from "assemblyscript";

import { ElementUtil } from "../utils/utils";

import { ContractInterpreter, SerializerInterpreter, TableInterpreter } from "./classdef";
import { NamedTypeNodeDef } from "./typedef";
import { RangeUtil } from "../utils/utils";

export class ContractProgram {
    program: Program;
    contract!: ContractInterpreter;
    tables: TableInterpreter[] = [];
    serializers: SerializerInterpreter[] = [];
    
    public definedTypeMap: Map<string, NamedTypeNodeDef> = new Map<string, NamedTypeNodeDef>();

    constructor(program: Program) {
        this.program = program;
        this.resolveContract();
    }
    
    private resolveContract(): void {
        let countContract = 0;

        this.program.elementsByName.forEach((element, _) => {
            if (ElementUtil.isTopContractClass(element)) {
                countContract ++;
                this.contract = new ContractInterpreter(<ClassPrototype>element);
                if (countContract > 1) {
                    throw Error(`Only one Contract class allowed! Trace ${RangeUtil.location(this.contract.declaration.range)}`);
                }
            }

            if (ElementUtil.isTableClassPrototype(element)) {
                let intercepter = new TableInterpreter(<ClassPrototype>element);
                this.tables.push(intercepter);
            }

            if (ElementUtil.isSerializerClassPrototype(element)) {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                this.serializers.push(intercepter);
            }
        });
        if (countContract != 1) {
            throw new Error(`The entry file should contain only one '@contract', in fact it has ${countContract}`);
        }
        this.setTypeSequence();
    }

    private setTypeSequence(): void {
        if (this.contract) {
            this.contract.genTypeSequence(this.definedTypeMap);
        }
    }
}

export function getContractInfo(program: Program): ContractProgram {
    let contract = new ContractProgram(program);
    return contract;
}
