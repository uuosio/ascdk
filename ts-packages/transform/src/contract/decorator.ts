import { CharCode, DecoratorKind, DecoratorNode, Expression, IdentifierExpression, NodeKind } from "assemblyscript";
import { ContractDecoratorKind } from "../enums/decorator";
import { RangeUtil } from "../utils/utils";

function fromNode(nameNode: Expression): ContractDecoratorKind {
    if (nameNode.kind == NodeKind.IDENTIFIER) {
        let nameStr = (<IdentifierExpression>nameNode).text;
        switch (nameStr.charCodeAt(0)) {
            case CharCode.a: {
                if (nameStr == "action") return ContractDecoratorKind.ACTION;
                break;
            }
            case CharCode.c: {
                if (nameStr == "contract") return ContractDecoratorKind.CONTRACT;
                break;
            }
            case CharCode.i: {
                if (nameStr == "ignore") return ContractDecoratorKind.IGNORE;
                break;
            }
            case CharCode.p: {
                if (nameStr == "packed") return ContractDecoratorKind.PACKED;
                if (nameStr == "primary") return ContractDecoratorKind.PRIMARY;
                break;
            }
            case CharCode.s: {
                if (nameStr == "secondary") return ContractDecoratorKind.SECONDARY;
                if (nameStr == "serializer") return ContractDecoratorKind.SERIALIZER;
                break;
            }
            case CharCode.t: {
                if (nameStr == "table") return ContractDecoratorKind.TABLE;
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
        throw new Error(`The contract don't support the decorator ${decorator.name.range.toString()}, please eheck ${RangeUtil.location(decorator.range)}`);
    }
    return kind;
}
