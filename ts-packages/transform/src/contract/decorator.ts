import { DecoratorKind, DecoratorNode, Expression, IdentifierExpression, NodeKind } from "assemblyscript";
import { ContractDecoratorKind } from "../enums/decorator";
import { LowerCaseCode } from "../utils/charutil";
import { RangeUtil } from "../utils/utils";

function fromNode(nameNode: Expression): ContractDecoratorKind {
    if (nameNode.kind == NodeKind.IDENTIFIER) {
        let nameStr = (<IdentifierExpression>nameNode).text;
        switch (nameStr.charCodeAt(0)) {
            case LowerCaseCode.a: {
                if (nameStr == "action") return ContractDecoratorKind.ACTION;
                break;
            }
            case LowerCaseCode.b: {
                if (nameStr == "binaryextension") return ContractDecoratorKind.BINARYEXTENSION;
                break;
            }
            case LowerCaseCode.c: {
                if (nameStr == "contract") return ContractDecoratorKind.CONTRACT;
                break;
            }
            case LowerCaseCode.i: {
                if (nameStr == "ignore") return ContractDecoratorKind.IGNORE;
                break;
            }
            case LowerCaseCode.o: {
                if (nameStr == "optional") return ContractDecoratorKind.OPTIONAL;
                break;
            }
            case LowerCaseCode.p: {
                if (nameStr == "packer") return ContractDecoratorKind.SERIALIZER;
                if (nameStr == "primary") return ContractDecoratorKind.PRIMARY;
                break;
            }
            case LowerCaseCode.s: {
                if (nameStr == "secondary") return ContractDecoratorKind.SECONDARY;
                if (nameStr == "serializer") return ContractDecoratorKind.SERIALIZER;
                break;
            }
            case LowerCaseCode.t: {
                if (nameStr == "table") return ContractDecoratorKind.TABLE;
                break;
            }
            case LowerCaseCode.v: {
                if (nameStr == "variant") return ContractDecoratorKind.VARIANT;
                break;
            }
        }
    }
    return ContractDecoratorKind.OTHER;
}

export function getCustomDecoratorKind(decorator: DecoratorNode): ContractDecoratorKind {
    if (decorator.decoratorKind != DecoratorKind.CUSTOM) {
        return ContractDecoratorKind.INTERNAL;
    }
    let kind = fromNode(decorator.name);
    if (kind == ContractDecoratorKind.OTHER) {
        throw new Error(`The contract don't support the decorator ${decorator.name.range.toString()}, please check ${RangeUtil.location(decorator.range)}`);
    }
    return kind;
}
