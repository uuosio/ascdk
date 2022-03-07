import { Contract, PermissionLevel, printString, action, contract, ActionWrapper, Asset, Symbol, Table, packer } from "as-chain"

@packer
class SayGoodbye extends Table {
    constructor (
        public name: string = "",
        public asset: Asset = new Asset(),
        public num: u64 = 0
    ) {
        super()
    }
}

@contract("inlineaction")
class InlineAction extends Contract {
    static sayGoodbyeAW: ActionWrapper = ActionWrapper.fromString("saygoodbye");
    static sayHelloAW: ActionWrapper = ActionWrapper.fromString("sayhello");
    
    @action("saygoodbye")
    sayGoodbye(name: string, asset: Asset, num: u64): void {
        printString(`+++goodbye, ${name} ${asset} ${num}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        const action = InlineAction.sayGoodbyeAW.act(this.receiver, new PermissionLevel(this.receiver))
        const actionParams = new SayGoodbye('alice', new Asset(0, new Symbol("EOS", 4)), 4)
        action.send(actionParams)
        printString(`hello, ${name}\n`)
    }
}