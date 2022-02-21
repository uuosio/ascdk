import { Asset, Name, contract, action, packer, printString, Action, PermissionLevel, check } from "as-chain";

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

    @action("testgencode")
    testGenCode(
        a1: string,
        a2: Asset,
        a3: u64,
        a4: u64[],
        a5: Asset[],
    ): void {
        printString(`+++test gen code
        ${a1},
        ${a2},
        ${a3},
        ${a4},
        ${a5},
        \n`);
    }

    @action("saygoodbye")
    sayGoodbye(name: string): void {
        printString(`+++goodbye, ${name}\n`);
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
        let raw1 = a.pack();
        a.unpack(raw1);
        let raw2 = a.pack();
        check(raw1.length == raw2.length, "bad value");
        for (let i=0; i<raw1.length; i++) {
            check(raw1[i] == raw2[i], "bad value");
        }
        a.send();
        printString(`hello, ${name}\n`);
    }
}
