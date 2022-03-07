import { Contract, PermissionLevel, printString, action, contract, ActionWrapper, Asset, Symbol } from "as-chain"

@contract("inlineaction")
class InlineAction extends Contract {
    static sayGoodbyeAW: ActionWrapper = new ActionWrapper("saygoodbye");
    static sayHelloAW: ActionWrapper = new ActionWrapper("sayhello");
    
    @action("saygoodbye")
    sayGoodbye(name: string, asset: Asset, num: u64): void {
        printString(`+++goodbye, ${name} ${asset} ${num}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        const action = InlineAction.sayGoodbyeAW.act(this.receiver, new PermissionLevel(this.receiver))
        const actionParams = new sayGoodbyeAction('alice', new Asset(0, new Symbol("EOS", 4)), 4)
        action.send(actionParams)
        printString(`hello, ${name}\n`)
    }
}