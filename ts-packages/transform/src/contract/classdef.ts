import {
    ElementKind,
    ClassPrototype,
    FunctionPrototype,
    PropertyPrototype,
    FieldPrototype,
    Range,
    CommonFlags,
    ClassDeclaration,
    OperatorKind
} from "assemblyscript";

import { ElementUtil, DecoratorUtil } from "../utils/utils";

import { Strings } from "../utils/primitiveutil";
import { ConstructorDef, FieldDef, FunctionDef, ActionFunctionDef, DBIndexFunctionDef} from "./elementdef";
import { NamedTypeNodeDef } from "./typedef";
import { TypeHelper } from "../utils/typeutil";
import { TypeKindEnum } from "../enums/customtype";
import { KeySelector } from "../preprocess/selector";
import { RangeUtil } from "../utils/utils";

export class ClassInterpreter {
    classPrototype: ClassPrototype;
    declaration: ClassDeclaration;
    camelName: string;
    className: string;
    instanceName: string;
    range: Range;
    doc: string[];
    fields: FieldDef[] = [];
    functions: FunctionDef[] = [];
    variousPrefix = "_";
    export = "";
    constructorFun: FunctionDef | null = null;

    constructor(clzPrototype: ClassPrototype) {
        this.classPrototype = clzPrototype;
        this.declaration = <ClassDeclaration>this.classPrototype.declaration;
        this.range = this.declaration.range;
        if (this.declaration.isAny(CommonFlags.EXPORT)) {
            this.export = "export ";
        }
        this.doc = DecoratorUtil.getDoc(this.declaration);
        this.className = clzPrototype.name;
        this.camelName = Strings.lowerFirstCase(this.className);
        this.instanceName = this.variousPrefix + this.className.toLowerCase();
        if (this.classPrototype.constructorPrototype != null) {
            this.constructorFun = new FunctionDef(this.classPrototype.constructorPrototype);
        }
    }

    resolveFieldMembers(): void {
        console.log("+++++this.className:", this.className)
        this.classPrototype.instanceMembers &&
            this.classPrototype.instanceMembers.forEach((element, _) => {
                if (element.kind == ElementKind.FIELD_PROTOTYPE) {
                    this.fields.push(new FieldDef(<FieldPrototype>element));
                }
            });
    }

    resolveFunctionMembers(): void {
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
    cntrFuncDefs: FunctionDef[] = [];
    actionFuncDefs: FunctionDef[] = [];

    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.version = "1.0";
        this.resolveFieldMembers();
        this.resolveContractClass();
    }

    private resolveContractClass(): void {
        this.classPrototype.instanceMembers &&
            this.classPrototype.instanceMembers.forEach((instance, _) => {
                if (ElementUtil.isCntrFuncPrototype(instance)) {
                    this.cntrFuncDefs.push(new ConstructorDef(<FunctionPrototype>instance));
                }
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
        this.cntrFuncDefs.forEach(funcDef => {
            funcDef.genTypeSequence(typeNodeMap);
        });
        this.actionFuncDefs.forEach(funcDef => {
            funcDef.genTypeSequence(typeNodeMap);
        });
    }
}

export class TableInterpreter extends ClassInterpreter {
    // The first case is lower.
    version: string;
    cntrFuncDefs: FunctionDef[] = [];
    primaryFuncDef: DBIndexFunctionDef | null = null;
    secondaryFuncDefs: DBIndexFunctionDef[] = [];

    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.version = "1.0";
        this.resolveFieldMembers();
        this.resolveContractClass();
    }

    private resolveContractClass(): void {
        if (this.classPrototype.instanceMembers) {
            this.classPrototype.instanceMembers.forEach((instance, _) => {
                if (ElementUtil.isPrimaryFuncPrototype(instance)) {
                    if (this.primaryFuncDef) {
                        throw Error(`More than one primary function defined! Trace: ${RangeUtil.location(instance.declaration.range)}`);
                    }
                    console.log("+++++++primary function:", instance.name);
                    this.primaryFuncDef = new DBIndexFunctionDef(<PropertyPrototype>instance, 0);
                }
                if (ElementUtil.isSecondaryFuncPrototype(instance)) {
                    console.log("+++++++secondary function:", instance.name);
                    let actionFunc = new DBIndexFunctionDef(<PropertyPrototype>instance, 1);
                    this.secondaryFuncDefs.push(actionFunc);
                }
            });
        }
    }

    public genTypeSequence(typeNodeMap: Map<string, NamedTypeNodeDef>): void {
        this.cntrFuncDefs.forEach(funcDef => {
            funcDef.genTypeSequence(typeNodeMap);
        });
        this.secondaryFuncDefs.forEach(funcDef => {
            funcDef.genTypeSequence(typeNodeMap);
        });
    }
}

export class SerializerInterpreter extends ClassInterpreter implements Matadata {
    index = 0;
    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.resolveFieldMembers();
        this.resolveFunctionMembers();
    }
}

export class EventInterpreter extends ClassInterpreter implements Matadata {
    index = 0;
    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.resolveFieldMembers();
        this.resolveFunctionMembers();
    }
}

export class StorageInterpreter extends ClassInterpreter  {
    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.resolveFieldMembers();
    }
}

export class DynamicIntercepter extends ClassInterpreter {
    constructor(clzPrototype: ClassPrototype) {
        super(clzPrototype);
        this.resolveFieldMembers();
        this.resolveFunctionMembers();
    }
}