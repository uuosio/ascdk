import * as chain from "as-chain"

@contract("hello")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("sayhello")
    sayGoodbye(name: string): void {
        chain.printString(`goodbye, ${name}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        let data = chain.Utils.stringToU8Array(name);
        let a = new chain.Action(
            [new chain.PermissionLevel(this.receiver, chain.Name.fromString("active"))],
            this.receiver,
            chain.Name.fromString("saygoodbye"),
            data);
        a.send();
        chain.printString(`hello, ${name}\n`)
    }
}
