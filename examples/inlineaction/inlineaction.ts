import { Contract, PermissionLevel, printString, InlineAction, Asset, Symbol, Table } from "as-chain"

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
@contract
class InlineActionContract extends Contract {
    static sayGoodbyeIA: InlineAction<SayGoodbye> = new InlineAction<SayGoodbye>("saygoodbye");
    
    @action("saygoodbye")
    sayGoodbye(name: string, asset: Asset, num: u64): void {
        printString(`+++goodbye, ${name} ${asset} ${num}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        const action = InlineActionContract.sayGoodbyeIA.act(this.receiver, new PermissionLevel(this.receiver))
        const actionParams = new SayGoodbye('alice', new Asset(0, new Symbol("EOS", 4)), 4)
        action.send(actionParams)
        printString(`hello, ${name}\n`)
    }
}