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
        let raw1 = a.pack();
        a.unpack(raw1);
        let raw2 = a.pack();
        chain.assert(raw1.length == raw2.length, "bad value");
        for (let i=0; i<raw1.length; i++) {
            chain.assert(raw1[i] == raw2[i], "bad value");
        }
        a.send();
        chain.printString(`hello, ${name}\n`)
    }
}
