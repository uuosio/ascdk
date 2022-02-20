import { Name, Action, PermissionLevel, printString, action, contract, packer } from "as-chain"

@packer
class MyData {
    constructor(
        public name: string
    ){}
}

@contract("hello")
class MyContract {
    constructor(
        public receiver: Name,
        public firstReceiver: Name,
        public action: Name) {
    }

    @action("saygoodbye")
    sayGoodbye(name: string): void {
        printString(`+++goodbye, ${name}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        let hello = new MyData('alice');
        let a = new Action(
            [new PermissionLevel(this.receiver, Name.fromString("active"))],
            this.receiver,
            Name.fromString("saygoodbye"),
            hello.pack(),
        );
        a.send();
        printString(`hello, ${name}\n`)
    }
}
