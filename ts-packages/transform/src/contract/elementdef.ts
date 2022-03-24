import {
    FieldDeclaration,
    NamedTypeNode,
    NodeKind,
    ParameterNode,
    TypeNode,
    Element,
    FieldPrototype,
    FunctionPrototype,
    PropertyPrototype,
    Range,
    DecoratorNode,
    FunctionDeclaration
} from "assemblyscript";

import { AstUtil, DecoratorUtil, ElementUtil, RangeUtil, EosioUtils } from "../utils/utils";
import { ContractDecoratorKind } from "../enums/decorator";
import { FieldDefHelper, TypeHelper } from "../utils/typeutil";
import { TypeKindEnum } from "../enums/customtype";
import { NamedTypeNodeDef } from "./typedef";

export class DecoratorsInfo {
    decorators: DecoratorNode[] | null;
    isIgnore = false;
    isPacked = false;
    capacity = 0;

    constructor(decorators: DecoratorNode[] | null) {
        this.decorators = decorators;

        if (this.decorators) {
            for (let decorator of this.decorators) {
                if (DecoratorUtil.isDecoratorKind(decorator, ContractDecoratorKind.IGNORE)) {
                    this.isIgnore = true;
                }
                if (DecoratorUtil.isDecoratorKind(decorator, ContractDecoratorKind.PACKED)) {
                    this.isPacked = true;
                    let decratorDef = new DecoratorNodeDef(decorator);
                    if (decratorDef.pairs.has("capacity")) {
                        this.capacity = Number(decratorDef.pairs.get("capacity"));
                    }
                }
            }
        }
    }
}
export class FieldDef {
    _index = 0;
    protected fieldPrototype: FieldPrototype;
    name: string;
    type!: NamedTypeNodeDef;
    varName: string;
    declaration: FieldDeclaration;
    decorators: DecoratorsInfo;
    rangeString = "";

    constructor(field: FieldPrototype) {
        this.fieldPrototype = field;
        this.name = field.name;
        this.declaration = <FieldDeclaration>field.declaration;
        this.rangeString = this.declaration.range.toString();
        this.varName = "_" + this.name;
        this.decorators = new DecoratorsInfo(this.fieldPrototype.declaration.decorators);
        let storeKey = this.fieldPrototype.internalName + this.name;
        this.resolveField();
    }

    /**
     * 
     */
    private resolveField(): void {
        let fieldDeclaration: FieldDeclaration = <FieldDeclaration>this.fieldPrototype.declaration;
        let commonType: TypeNode | null = fieldDeclaration.type;
        if (commonType && commonType.kind == NodeKind.NAMEDTYPE) {
            let typeNode = <NamedTypeNode>commonType;
            this.type = new NamedTypeNodeDef(this.fieldPrototype, typeNode);
        }
        // IF the type is array, special process
        if (this.type.typeKind == TypeKindEnum.ARRAY) {
            let str = FieldDefHelper.getConcreteStorable(this);
            this.type.codecTypeAlias = FieldDefHelper.getStorableExport(this);
            this.type.instanceType = str;
            this.type.capacity = this.decorators.capacity;
        }

        if (this.type.typeKind == TypeKindEnum.MAP) {
            let str = FieldDefHelper.getConcreteStorable(this);
            this.type.codecTypeAlias = FieldDefHelper.getStorableExport(this);
            this.type.instanceType = str;
        }
    }
}

export class ParameterNodeDef {
    parameterNode: ParameterNode;
    name: string;
    type: NamedTypeNodeDef;

    constructor(parent: Element, parameterNode: ParameterNode) {
        this.parameterNode = parameterNode;
        this.name = this.parameterNode.name.range.toString();
        this.type = new NamedTypeNodeDef(parent, <NamedTypeNode>this.parameterNode.type);
    }

    generateTypeSeq(typeNodeMap: Map<string, NamedTypeNodeDef>): void {
        this.type.genTypeSequence(typeNodeMap);
    }
}

export class DecoratorNodeDef {
    private decorator: DecoratorNode;
    pairs: Map<string, string>;
    constructor(decorator: DecoratorNode) {
        this.decorator = decorator;
        this.pairs = new Map<string, string>();
        if (decorator.args) {
            decorator.args.forEach(expression => {
                if (expression.kind == NodeKind.BINARY) {
                    let identifier = AstUtil.getIdentifier(expression);
                    let val = AstUtil.getBinaryExprRight(expression);
                    this.pairs.set(identifier, val);
                }
            });
        }
    }
}

export class MessageDecoratorNodeDef extends DecoratorNodeDef {
    payable = false;
    mutates = "true";
    selector = "";

    notify = false;
    ignore = false;
    actionName = ""
    constructor(decorator: DecoratorNode) {
        super(decorator);
        if (decorator.args) {
            if (decorator.args.length == 0 || decorator.args.length > 2) {
                throw new Error(`Decorator: Invalid action decorator. Trace: ${RangeUtil.location(decorator.range)} `);
            }

            this.actionName = AstUtil.getIdentifier(decorator.args![0]);
            if (!EosioUtils.isValidName(this.actionName)) {
                throw new Error(`Decorator: Invalid action name. Trace: ${RangeUtil.location(decorator.range)} `);
            }

            for (let i=1; i<decorator.args.length; i++) {
                let arg = AstUtil.getIdentifier(decorator.args![i]);
                if (arg == "notify") {
                    this.notify = true;
                }

                if (arg == "ignore") {
                    this.ignore = true;
                }
            }
        }
    }
}

export class FunctionDef {
    protected funcProto: FunctionPrototype;
    declaration: FunctionDeclaration;
    parameters: ParameterNodeDef[] = [];
    methodName: string;
    isReturnable = false;
    isConstructor = false;
    returnType: NamedTypeNodeDef | null = null;
    rangeString = "";
    defaultVals: string[] = [];

    constructor(funcPrototype: FunctionPrototype) {
        this.declaration = <FunctionDeclaration>funcPrototype.declaration;
        this.funcProto = funcPrototype;
        this.methodName = this.funcProto.name;
        this.rangeString = this.declaration.range.toString();
        this.resolve();
    }

    resolve(): void {
        let params = this.funcProto.functionTypeNode.parameters;
        params.forEach(param => {
            this.parameters.push(new ParameterNodeDef(this.funcProto, param));
        });
        this.resolveReturnType();
    }

    resolveReturnType(): void {
        if (this.funcProto.name == "constructor") {
            this.isConstructor = true;
            return ;
        }
        let returnType = this.funcProto.functionTypeNode.returnType;
        if (returnType.range.toString() == '') {
            this.returnType = null;
            return;
        }
        let returnTypeDesc = new NamedTypeNodeDef(this.funcProto, <NamedTypeNode>returnType);
        if (returnTypeDesc.typeKind != TypeKindEnum.VOID) {
            returnTypeDesc.codecType = TypeHelper.getCodecType(returnTypeDesc.plainType);
            this.isReturnable = true;
            this.returnType = returnTypeDesc;
        } else {
            this.returnType = null;
        }
    }

    public genTypeSequence(typeNodeMap: Map<string, NamedTypeNodeDef>): void {
        this.parameters.forEach(item => {
            item.generateTypeSeq(typeNodeMap);
        });
        if (this.isReturnable) {
            this.returnType!.genTypeSequence(typeNodeMap);
        }
    }
}

export class ActionFunctionDef extends FunctionDef {
    messageDecorator: MessageDecoratorNodeDef;
    bodyRange: Range;
    mutatable = true;

    constructor(funcPrototype: FunctionPrototype) {
        super(funcPrototype);
        AstUtil.checkPublic(this.declaration);
        let msgDecorator = AstUtil.getSpecifyDecorator(funcPrototype.declaration, ContractDecoratorKind.ACTION);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.messageDecorator = new MessageDecoratorNodeDef(msgDecorator!);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.bodyRange = this.funcProto.bodyNode!.range;
        if (this.messageDecorator.mutates == "false") {
            this.mutatable = false;
        }
    }
}

export class DBIndexFunctionDef {
    _index = 0;
    messageDecorator: DecoratorNodeDef;
    bodyRange: Range;
    getterPrototype: FunctionDef | null;
    setterPrototype: FunctionDef | null;

    constructor(propertyPrototype: PropertyPrototype, indexType: number) {
        if (propertyPrototype.getterPrototype) {
            this.getterPrototype = new FunctionDef(propertyPrototype.getterPrototype!);
            // console.log("++++getterPrototype.rangeString:", this.getterPrototype.rangeString);
        } else {
            this.getterPrototype = null;
        }

        if (propertyPrototype.setterPrototype) {
            this.setterPrototype = new FunctionDef(propertyPrototype.setterPrototype);
            // console.log("++++setterPrototype.rangeString:", this.setterPrototype.rangeString);
        } else {
            this.setterPrototype = null;
        }

        AstUtil.checkPublic(propertyPrototype.getterPrototype!.declaration);
        let decoratorKind: ContractDecoratorKind;
        if (indexType == 0) {
            decoratorKind = ContractDecoratorKind.PRIMARY;
        } else {
            decoratorKind = ContractDecoratorKind.SECONDARY;
        }
        let msgDecorator = AstUtil.getSpecifyDecorator(propertyPrototype.getterPrototype!.declaration, decoratorKind);
        this.messageDecorator = new DecoratorNodeDef(msgDecorator!);
        this.bodyRange = propertyPrototype.getterPrototype!.declaration.range;
    }
}