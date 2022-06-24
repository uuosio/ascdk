import {
    ClassPrototype,
    Program,
    ElementKind,
    CommonFlags,
} from "assemblyscript";

import { ElementUtil } from "../utils/utils";

import {
    ContractInterpreter,
    SerializerInterpreter,
    ClassInterpreter,
    TableInterpreter,
    VariantInterpreter,
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
import * as path from "path"

export class ContractProgram {
    program: Program;
    contract!: ContractInterpreter;
    tables: TableInterpreter[] = [];
    serializers: ClassInterpreter[] = [];
    optionals: SerializerInterpreter[] = [];
    binaryExtensions: SerializerInterpreter[] = [];
    variants: VariantInterpreter[] = [];
    customAbiTypes: SerializerInterpreter[] = [];
    allClasses: ClassInterpreter[] = [];
    hasApplyFunc: boolean = false;

    public definedTypeMap: Map<string, NamedTypeNodeDef> = new Map<string, NamedTypeNodeDef>();

    constructor(program: Program) {
        this.program = program;
        this.resolveContract();
    }
    
    private resolveContract(): void {
        let countContract = 0;

        let values = this.program.elementsByName.values();
        for (let it = values.next(); !it.done; it = values.next() ) {
            let element = it.value;
            if (ElementUtil.isTopContractClass(element)) {
                process.userEntryFilePath = path.dirname(path.dirname(element.internalName));
                break;
            }
        }

        values = this.program.elementsByName.values();
        for (let it = values.next(); !it.done; it = values.next() ) {
            let element = it.value;
            if (element.name == "apply" && 
                    element.kind == ElementKind.FUNCTION_PROTOTYPE &&
                    (element.flags && CommonFlags.EXPORT) == CommonFlags.EXPORT) {
                this.hasApplyFunc = true;
                break;
            }
        }

        this.program.elementsByName.forEach((element, _) => {
            if (ElementUtil.isClass(element)) {
                this.allClasses.push(new ClassInterpreter(<ClassPrototype>element));
            }

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
                this.CheckClassFields(intercepter);
                return;
            }

            if (ElementUtil.isSerializerClassPrototype(element)) {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                this.AddSerializer(intercepter);
                this.CheckClassFields(intercepter);
                return;
            }

            if (element.name == "Optional") {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                this.optionals.push(intercepter);
                return;
            }

            if (element.name == "BinaryExtension") {
                let intercepter = new SerializerInterpreter(<ClassPrototype>element);
                this.binaryExtensions.push(intercepter);
                return;
            }

            if (ElementUtil.isVariantClassPrototype(element)) {
                let intercepter = new VariantInterpreter(<ClassPrototype>element);
                let fieldMap = new Map<string, boolean>();
                intercepter.fields.forEach(x => {
                    let tp = x.type.plainTypeNode
                    if (fieldMap.has(tp)) {
                        throw new Error(`Duplicated type in variant ${intercepter.className}! Trace ${RangeUtil.location(x.declaration.range)}`);
                    }
                    fieldMap.set(tp, true);
                });
                this.variants.push(intercepter);
                this.CheckClassFields(intercepter);
                return;
            }
        });

        if (!this.contract) {
            return;
        }

        if (countContract != 1) {
            throw new Error(`The entry file should contain only one '@contract', in fact it has ${countContract}`);
        }

        this.contract!.actionFuncDefs.forEach(func => {
            func.parameters.forEach(para => {
                if ((para.type.plainType == "Optional" || para.type.plainType == "BinaryExtension") && para.type.typeArguments) {
                    let typeName = para.type.typeArguments![0].plainType;
                    let typeClass = this.findClass(typeName);
                    if (typeClass) {
                        this.AddSerializer(typeClass);
                        this.CheckClassFields(typeClass);
                    }
                    return;
                }

                let cls = this.findClass(para.type.plainTypeNode);
                if (cls) {
                    cls = new SerializerInterpreter(cls.classPrototype)
                    this.AddSerializer(cls);
                    this.CheckClassFields(cls);
                }
            });
        });

        this.setTypeSequence();
    }

    private CheckClassFields(cls: ClassInterpreter) {
        cls.fields.forEach(field => {
            if ((field.type.plainType == "Optional" || field.type.plainType == "BinaryExtension") && field.type.typeArguments) {
                let typeName = field.type.typeArguments![0].plainType;
                let typeClass = this.findClass(typeName);
                if (typeClass) {
                    this.AddSerializer(typeClass);
                    this.CheckClassFields(typeClass);
                }
                return;
            }

            let cls2 = this.allClasses.find(cls2 => {
                return cls2.className == field.type.plainTypeNode
            });

            if (cls2) {
                cls2 = new SerializerInterpreter(cls2.classPrototype)
                this.AddSerializer(cls2);
                this.CheckClassFields(cls2);
            }
        });
    }

    private AddSerializer(cls: ClassInterpreter) {
        if (TypeHelper.primitiveToAbiMap.get(cls.className)) {
            return
        }

        if (this.tables.find(x2 => x2.className == cls.className)) {
            return
        }

        if (this.variants.find(x2 => x2.className == cls.className)) {
            return
        }

        if (this.optionals.find(x2 => x2.className == cls.className)) {
            return
        }

        if (this.binaryExtensions.find(x2 => x2.className == cls.className)) {
            return
        }

        if (this.serializers.find(x => x.className == cls.className)) {
            return
        }
        this.serializers.push(cls);
    }

    private setTypeSequence(): void {
        if (this.contract) {
            this.contract.genTypeSequence(this.definedTypeMap);
        }
    }

    findType(type: NamedTypeNodeDef) {
        let plainType = type.plainTypeNode;
        if (type.typeNode.isNullable) {
            plainType = plainType.split('|')[0].trim();
        }

        if (type.typeKind == TypeKindEnum.ARRAY) {
            plainType = plainType.replace('[]', '');
            plainType = plainType.replace('Array<', '').replace('>', '');
        }

        if (plainType.indexOf('chain.') == 0) {
            plainType = plainType.replace('chain.', '');
        }

        let tp = TypeHelper.primitiveToAbiMap.get(plainType)!;
        if (tp) {
            return tp;
        }

        if (type.plainType == "Optional" || type.plainType == "OptionalNumber") {
            let typeName = type.typeArguments![0].plainTypeNode;
            let tp = TypeHelper.primitiveToAbiMap.get(typeName)!;
            if (tp) {
                return tp + "?";
            }
            return typeName + "?";
        }

        if (type.plainType == "OptionalString") {
            return "string?";
        }

        if (type.plainType == "BinaryExtension") {
            let typeName = type.typeArguments![0].plainTypeNode;
            let tp = TypeHelper.primitiveToAbiMap.get(typeName)!;
            if (tp) {
                return tp + "$";
            }
            return typeName + "$";
        }

        let cls = <ClassInterpreter>this.allClasses.find(x => {
            return x.className == plainType;
        });

        if (cls) {
            return cls.className;
        }
        return "";
    }

    addAbiClass(cls: SerializerInterpreter) {
        if (this.customAbiTypes.find(x => x.className == cls.className)) {
            return;
        }

        if (ElementUtil.isVariantClassPrototype(cls.classPrototype)) {
            return;
        }

        if (ElementUtil.isOptionalClassPrototype(cls.classPrototype)) {
            return;
        }

        if (ElementUtil.isBinaryExtensionClassPrototype(cls.classPrototype)) {
            return;
        }

        this.customAbiTypes.push(cls);

        cls.fields.forEach(x => {
            let cls = this.findClass(x.type.plainTypeNode);
            if (cls) {
                this.addAbiClass(cls);
            }
        });
    }

    parseField(name: string, type: NamedTypeNodeDef) {
        let abiField = new ABIStructField();
        abiField.name = name;

        abiField.type = this.findType(type);
        if (!abiField.type) {
            throw Error(`type of ${name} not found: ${type.plainTypeNode}`)
        }
    
        if (type.typeKind == TypeKindEnum.ARRAY) {
            if (abiField.type == "uint8") {
                abiField.type = "bytes";
            } else {
                abiField.type += "[]";
            }
        }
        return abiField;
    }
    
    findClass(className: string) {
        className = className.replace('[]', '');
        className = className.replace('Array<', '').replace('>', '');    

        if (TypeHelper.primitiveToAbiMap.get(className)) {
            return
        }

        let cls = this.allClasses.find(cls => {
            return cls.className == className;
        });
        if (cls) {
            return new SerializerInterpreter(cls.classPrototype);
        }
    }

    findAllAbiTypes() {
        [
            this.variants,
            this.tables,
            this.optionals,
            this.binaryExtensions
        ].forEach(classes => {
            classes.forEach(cls => {
                cls.fields.forEach(field => {
                    let plainType = field.type.plainTypeNode;
                    let fieldClassType = this.findClass(plainType)
                    if (fieldClassType) {
                        this.addAbiClass(fieldClassType);
                    }
                });
            });
        })

        this.contract.actionFuncDefs.forEach(func => {
            func.parameters.forEach(parameter => {
                if ((parameter.type.plainType == "Optional" || parameter.type.plainType == "BinaryExtension") && parameter.type.typeArguments) {
                    let typeName = parameter.type.typeArguments![0].plainType;
                    let typeClass = this.findClass(typeName);
                    if (typeClass) {
                        this.addAbiClass(typeClass);
                    }
                    return;
                }

                let cls = this.findClass(parameter.type.plainTypeNode)
                if (cls) {
                    this.addAbiClass(cls);
                }
            });
        });
    }

    getAbiInfo() {
        let abi = new ABI();
        this.findAllAbiTypes();

        this.variants.forEach((variant, i) => {
            if (variant.no_abigen) {
                return;
            }
            let def = new VariantDef();
            def.name = variant.className;
            variant.fields.forEach((field, i) => {
                let ret = this.parseField(field.name, field.type);
                def.types.push(ret.type);
            });
            abi.variants.push(def);
        });

        this.tables.forEach((table, i) => {
            if (table.no_abigen) {
                return;
            }

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
            // Ignore notify actions in ABI
            if ((<ActionFunctionDef>func).messageDecorator.notify) {
                return;
            }

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

        let cmp = (a, b) => {
            if (a == b) {
                return 0;
            }
            if (a < b) {
                return -1;
            } else {
                return 1;
            }
        }

        abi.structs.sort((a, b) => {
            return cmp(a.name, b.name);
        });

        abi.actions.sort((a, b) => {
            return cmp(a.name, b.name);
        });

        abi.tables.sort((a, b) => {
            return cmp(a.name, b.name);
        });

        abi.variants.sort((a, b) => {
            return cmp(a.name, b.name);
        });

        return JSON.stringify(abi, null, 2);
    }
}

export function getContractInfo(program: Program): ContractProgram {
    let contract = new ContractProgram(program);
    return contract;
}
