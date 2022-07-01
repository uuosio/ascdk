import {
    ElementKind,
    ClassPrototype,
    FunctionPrototype,
    PropertyPrototype,
    FieldPrototype,
    Range,
    CommonFlags,
    ClassDeclaration,
    OperatorKind,
    DecoratorNode,
} from "assemblyscript";

import { AstUtil, ElementUtil, DecoratorUtil, EosioUtils } from "../utils/utils";

import { Strings } from "../utils/primitiveutil";
import { FieldDef, FunctionDef, ActionFunctionDef, DBIndexFunctionDef} from "./elementdef";
import { NamedTypeNodeDef } from "./typedef";
import { RangeUtil } from "../utils/utils";

import { ContractDecoratorKind } from "../enums/decorator";


export class ClassInterpreter {
    classPrototype: ClassPrototype;
    declaration: ClassDeclaration;
    camelName: string;
    className: string;
    instanceName: string;
    range: Range;
    fields: FieldDef[] = [];
    functions: FunctionDef[] = [];
    variousPrefix = "_";
    export = "";
    constructorFun: FunctionDef | null = null;

    no_codegen: boolean = false;
    no_abigen: boolean = false;
    decorator: DecoratorNode | null = null;

    constructor(clzPrototype: ClassPrototype) {
        this.classPrototype = clzPrototype;
        this.declaration = <ClassDeclaration>this.classPrototype.declaration;
        this.range = this.declaration.range;
        if (this.declaration.isAny(CommonFlags.EXPORT)) {
            this.export = "export ";
        }
        this.className = clzPrototype.name;
        this.camelName = Strings.lowerFirstCase(this.className);
        this.instanceName = this.variousPrefix + this.className.toLowerCase();
        if (this.classPrototype.constructorPrototype != null) {
            this.constructorFun = new FunctionDef(this.classPrototype.constructorPrototype);
        }

        let classTypes = [
            ContractDecoratorKind.TABLE,
            ContractDecoratorKind.SERIALIZER,
            ContractDecoratorKind.VARIANT,
        ];

        if (this.classPrototype.interfacePrototypes) {
            let hasPackerInterface = this.classPrototype.interfacePrototypes.find(x => {
                return x.internalName == "~lib/as-chain/serializer/Packer" || 
                    x.internalName == "~lib/as-chain/mi/MultiIndexValue";
            });

            if (hasPackerInterface) {
                this.no_codegen = true;
            }
        }

        for (let i=0; i<classTypes.length; i++) {
            let kind = classTypes[i];
            this.decorator = AstUtil.getSpecifyDecorator(clzPrototype.declaration, kind);
            if (this.decorator) {
                break;
            }
        }
    
        if (!this.decorator) {
            return;
        }

        if (!this.decorator.args) {
            return;
        }

        for (let i=0; i<this.decorator.args!.length; i++) {
            let arg = AstUtil.getIdentifier(this.decorator.args![i]);

            if (arg == "nocodegen") {
                this.no_codegen = true;
            }

            if (arg == "noabigen") {
                this.no_abigen = true;
            }
        }
    }

    resolveFieldMembers(): void {
        if (this.fields.length > 0) {
            return;
        }

        this.classPrototype.instanceMembers &&
            this.classPrototype.instanceMembers.forEach((element, _) => {
                if (element.kind == ElementKind.FIELD_PROTOTYPE) {
                    this.fields.push(new FieldDef(<FieldPrototype>element));
                }
            });
    }

    resolveFunctionMembers(): void {
        if (this.functions.length > 0) {
            return;
        }

        this.classPrototype.instanceMembers &&
            this.classPrototype.instanceMembers.forEach((element, _) => {
                if (element.kind == ElementKind.FUNCTION_PROTOTYPE) {
                    let func = new FunctionDef(<FunctionPrototype>element);
                    if (!func.isConstructor) {
                        this.functions.push(func);
                    } else {
                        this.constructorFun = func;
                    }
                }
            });
    }

    genTypeSequence(typeNodeMap: Map<string, NamedTypeNodeDef>): void {
        this.fields.forEach(item => {
            if (item.type) {
                item.type.genTypeSequence(typeNodeMap);
            }
        });
    }
}

export class ContractInterpreter extends ClassInterpreter {
    // The first case is lower.
    version: string;
    hasFinalizeFunc: boolean = false;
    actionFuncDefs: FunctionDef[] = [];

    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.version = "1.0";
        this.resolveFieldMembers();
        this.resolveContractClass();
        this.hasFinalizeFunc = this.hasFinalizeFunction();
    }

    public hasFinalizeFunction(): boolean {
        if (!this.classPrototype.instanceMembers) {
            return false;
        }
        let member = this.classPrototype.instanceMembers.get("finalize");
        if (!member) {
            return false;
        }
        if (member.kind == ElementKind.FUNCTION_PROTOTYPE) {
            let funcType = <FunctionPrototype>member;
            return funcType.name == "finalize"
        }
        return false;
    }

    private resolveContractClass(): void {
        this.classPrototype.instanceMembers &&
            this.classPrototype.instanceMembers.forEach((instance, _) => {
                if (ElementUtil.isActionFuncPrototype(instance)) {
                    let actionFunc = new ActionFunctionDef(<FunctionPrototype>instance);
                    this.actionFuncDefs.push(actionFunc);
                }
            });
        this.resolveBaseClass(this.classPrototype);
    }

    private resolveBaseClass(sonClassPrototype: ClassPrototype): void {
        if (sonClassPrototype.basePrototype) {
            let basePrototype = sonClassPrototype.basePrototype;
            basePrototype.instanceMembers &&
                basePrototype.instanceMembers.forEach((instance, _) => {
                    if (ElementUtil.isActionFuncPrototype(instance)) {
                        let actionFunc = new ActionFunctionDef(<FunctionPrototype>instance);
                        this.actionFuncDefs.push(actionFunc);
                    }
                });
            this.resolveBaseClass(basePrototype);
        }
    }

    public genTypeSequence(typeNodeMap: Map<string, NamedTypeNodeDef>): void {
        this.actionFuncDefs.forEach(funcDef => {
            funcDef.genTypeSequence(typeNodeMap);
        });
    }
}

export class TableInterpreter extends ClassInterpreter {
    // The first case is lower.
    tableName: string = "";
    singleton: boolean = false;
    version: string;
    primaryFuncDef: DBIndexFunctionDef | null = null;
    secondaryFuncDefs: DBIndexFunctionDef[] = [];
    hasSecondaryIndexes: boolean = false;

    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.version = "1.0";
        this.resolveFieldMembers();
        this.resolveContractClass();

        if (!this.decorator) {
            return;
        }

        if (!this.decorator.args) {
            return;
        }

        this.tableName = AstUtil.getIdentifier(this.decorator.args[0]);
        if (!EosioUtils.isValidName(this.tableName)) {
            throw new Error(`Decorator: Invalid table name. Trace: ${RangeUtil.location(this.decorator.range)} `);
        }

        for (let i=1; i<this.decorator.args.length; i++) {
            let arg = AstUtil.getIdentifier(this.decorator.args[i]);
            if (arg == "singleton") {
                this.singleton = true;
            }
        }

        if (this.secondaryFuncDefs.length > 0) {
            this.hasSecondaryIndexes = true;
        }
    }

    private resolveContractClass(): void {
        if (this.classPrototype.instanceMembers) {
            this.classPrototype.instanceMembers.forEach((instance, _) => {
                if (ElementUtil.isPrimaryFuncPrototype(instance)) {
                    if (this.primaryFuncDef) {
                        throw Error(`More than one primary function defined! Trace: ${RangeUtil.location(instance.declaration.range)}`);
                    }
                    // console.log("+++++++primary function:", instance.name);
                    this.primaryFuncDef = new DBIndexFunctionDef(<PropertyPrototype>instance, 0);
                }
                if (ElementUtil.isSecondaryFuncPrototype(instance)) {
                    // console.log("+++++++secondary function:", instance.name);
                    let actionFunc = new DBIndexFunctionDef(<PropertyPrototype>instance, 1);
                    this.secondaryFuncDefs.push(actionFunc);
                }
            });
        }
    }

    // public genTypeSequence(typeNodeMap: Map<string, NamedTypeNodeDef>): void {
    //     this.secondaryFuncDefs.forEach(funcDef => {
    //         funcDef.genTypeSequence(typeNodeMap);
    //     });
    // }
}

export class SerializerInterpreter extends ClassInterpreter {
    index = 0;
    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.resolveFieldMembers();
        this.resolveFunctionMembers();
    }
}

export class VariantInterpreter extends ClassInterpreter {
    index = 0;
    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.resolveFieldMembers();
        this.resolveFunctionMembers();
    }
}
