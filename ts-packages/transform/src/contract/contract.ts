import {
    ClassPrototype,
    Program,
} from "assemblyscript";

import { ElementUtil } from "../utils/utils";

import {
    ContractInterpreter,
    SerializerInterpreter,
    ClassInterpreter,
    TableInterpreter
} from "./classdef";

import { NamedTypeNodeDef } from "./typedef";
import { RangeUtil } from "../utils/utils";
import {
    ABI,
    ABIAction,
    ABIStruct,
    ABIStructField,
    ABITable,
    VariantDef,
} from "../abi/abi";

import { ActionFunctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { TypeHelper } from "../utils/typeutil";

export class ContractProgram {
    program: Program;
    contract!: ContractInterpreter;
    tables: TableInterpreter[] = [];
    serializers: SerializerInterpreter[] = [];
    optionals: SerializerInterpreter[] = [];
    binaryExtensions: SerializerInterpreter[] = [];
    variants: SerializerInterpreter[] = [];
    customAbiTypes: ClassInterpreter[] = [];

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

            if (ElementUtil.isOptionalClassPrototype(element)) {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                if (intercepter.fields.length > 1) {
                    throw Error(`optional class can only contain 1 member. Trace: ${RangeUtil.location(intercepter.range)}`);
                }
                let field = intercepter.fields[0];
                if (!field.declaration.type?.isNullable) {
                    throw Error(`optional member must be nullable! Trace: ${RangeUtil.location(intercepter.range)}`);
                }
                this.optionals.push(intercepter);
            }

            if (ElementUtil.isBinaryExtensionClassPrototype(element)) {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                if (intercepter.fields.length > 1) {
                    throw Error(`optional class can only contain 1 member. Trace: ${RangeUtil.location(intercepter.range)}`);
                }
                let field = intercepter.fields[0];
                if (!field.declaration.type?.isNullable) {
                    throw Error(`optional member must be nullable! Trace: ${RangeUtil.location(intercepter.range)}`);
                }
                this.binaryExtensions.push(intercepter);
            }

            if (ElementUtil.isVariantClassPrototype(element)) {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                let fieldMap = new Map<string, boolean>();
                intercepter.fields.forEach(x => {
                    let tp = x.type.plainTypeNode
                    if (fieldMap.has(tp)) {
                        throw new Error(`Duplicated type in variant ${intercepter.className}! Trace ${RangeUtil.location(x.declaration.range)}`)
                    }
                    fieldMap.set(tp, true);
                })
                this.variants.push(intercepter);
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

    findType(plainType: string) {
        let tp = TypeHelper.primitiveToAbiMap.get(plainType)!;
        if (tp) {
            return tp;
        }

        let cls = <ClassInterpreter>this.serializers.find(x => {
            return x.className == plainType;
        });

        if (!cls) {
            cls = <ClassInterpreter>this.tables.find(x => {
                return x.className == plainType;
            });
        }

        if (cls) {
            if (!this.customAbiTypes.find(x => {
                return x.className == plainType;
            })) {
                this.customAbiTypes.push(cls);
            }
            return cls.className;
        }

        cls = <ClassInterpreter>this.variants.find(x => {
            return x.className == plainType;
        });

        if (cls) {
            return cls.className;
        }

        cls = <ClassInterpreter>this.optionals.find(x => {
            return x.className == plainType;
        });

        if (cls) {
            plainType = cls.fields[0].type.plainTypeNode.replace("chain.", "");
            let type = this.findType(plainType)!;
            if (type) {
                return type + "?";
            }
        }

        cls = <ClassInterpreter>this.binaryExtensions.find(x => {
            return x.className == plainType;
        });

        if (cls) {
            plainType = cls.fields[0].type.plainTypeNode.replace("chain.", "");
            let type = this.findType(plainType)!;
            if (type) {
                return type + "$";
            }
        }
        return "";
    }

    parseField(name: string, type: NamedTypeNodeDef) {
        let abiField = new ABIStructField();
        abiField.name = name;
        let plainType = type.plainTypeNode;
        if (type.typeKind == TypeKindEnum.ARRAY) {
            plainType = plainType.replace('[]', '');
        }

        if (plainType.indexOf('chain.') == 0) {
            plainType = plainType.replace('chain.', '');
        }

        abiField.type = this.findType(plainType);
        if (!abiField.type) {
            throw Error(`type not found: ${plainType}`)
        }
    
        if (type.typeKind == TypeKindEnum.ARRAY) {
            abiField.type += '[]';
        }
        return abiField;
    }
    
    getAbiInfo() {
        let abi = new ABI();

        this.variants.forEach((variant, i) => {
            let def = new VariantDef();
            def.name = variant.className;
            variant.fields.forEach((field, i) => {
                let ret = this.parseField(field.name, field.type);
                def.types.push(ret.type);
            });
            abi.variants.push(def);
        });

        this.tables.forEach((table, i) => {
            let abiTable = new ABITable();
            abiTable.name = table.tableName;
            abiTable.type = table.className;
            abiTable.index_type = 'i64';
            abi.tables.push(abiTable);
    
            let abiStruct = new ABIStruct();
            abiStruct.name = table.className;
            abiStruct.base = "";
            table.fields.forEach((field, i) => {
                let ret = this.parseField(field.name, field.type);
                if (ret.type.endsWith("$")) {
                    if (i+1 != table.fields.length) {
                        throw Error(`binaryextension can only appear as the last member! Trace ${RangeUtil.location(field.declaration.range)}`);
                    }
                }
                abiStruct.fields.push(ret);
            });
            abi.structs.push(abiStruct);
        });

        this.contract.actionFuncDefs.forEach((func, i) => {
            let actionName = (<ActionFunctionDef>func).messageDecorator.actionName;
            let action = new ABIAction(actionName, actionName);
            abi.actions.push(action);
    
            let abiStruct = new ABIStruct();
            abiStruct.name = actionName;
            abiStruct.base = "";
            func.parameters.forEach(parameter => {
                let ret = this.parseField(parameter.name, parameter.type);
                abiStruct.fields.push(ret);
            });
            abi.structs.push(abiStruct);
        });

        this.customAbiTypes.forEach(cls => {
            let found = abi.structs.find(x => {
                return x.name == cls.className
            });

            if (found) {
                return;
            }

            let abiStruct = new ABIStruct();
            abiStruct.name = cls.className;
            abiStruct.base = "";
            cls.fields.forEach(field => {
                let ret = this.parseField(field.name, field.type);
                abiStruct.fields.push(ret);
            });
            abi.structs.push(abiStruct);
        });
        return JSON.stringify(abi, null, 2);
    }
}

export function getContractInfo(program: Program): ContractProgram {
    let contract = new ContractProgram(program);
    return contract;
}
