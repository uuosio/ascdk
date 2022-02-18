import * as chain from "as-chain"
import { Utils } from "as-chain/utils"

@packer
class MyData {
    constructor(
        public name: string
    ){}
}

@contract("hello")
class MyContract {
    constructor(
        public receiver: chain.Name,
        public firstReceiver: chain.Name,
        public action: chain.Name) {
    }

    @action("saygoodbye")
    sayGoodbye(name: string): void {
        chain.printString(`+++goodbye, ${name}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        let hello = new MyData('alice');
        let a = new chain.Action(
            [new chain.PermissionLevel(this.receiver, chain.Name.fromString("active"))],
            this.receiver,
            chain.Name.fromString("saygoodbye"),
            hello.pack(),
        );
        a.send();
        chain.printString(`hello, ${name}\n`)
    }
}
