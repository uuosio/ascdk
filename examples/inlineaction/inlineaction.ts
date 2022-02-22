import { Contract, PermissionLevel, printString, action, contract, packer, ActionWrapper } from "as-chain"

@packer
class MyData {
    constructor(
        public name: string
    ){}
}

@contract("inlineaction")
class InlineAction extends Contract {
    @action("saygoodbye")
    sayGoodbye(name: string): void {
        printString(`+++goodbye, ${name}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        const actionData = new MyData('alice');
        const actionWrapper = new ActionWrapper("saygoodbye")
        const action = actionWrapper.act(this.receiver, new PermissionLevel(this.receiver))
        action.send(actionData)
        printString(`hello, ${name}\n`)
    }
}