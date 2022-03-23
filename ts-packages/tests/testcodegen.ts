import {
    Asset,
    Symbol,
    Name,
    Action,
    PermissionLevel,
    contract, action, packer, 
    printString,
    check,
    getSender,
    Contract,
} from "as-chain";

@packer
class MyData {
    constructor(
        public name: string = ""
    ){}
}

@optional
class MyOptional {
    constructor(
        public a: Asset | null = null
    ){}
}

@binaryextension
class MyExtension {
    constructor(
        public a: Asset | null = null
    ){}
}

@packer
class MyClass {
    aaa!: u64;
    bbb: u64 | null;
    constructor(
        aaa: u64,
        bbb: u64
    ){
        this.aaa = aaa;
        this.bbb = bbb;
    }
}


@contract("hello")
class MyContract extends Contract {
    @action("testgencode")
    testGenCode(
        a1: string,
        a2: Asset,
        a3: u64,
        a4: u64[],
        a5: Asset[],
        a6: MyOptional,
        a7: MyData,
        a8: MyExtension,
    ): void {
        check(!a6.a, "bad value");
        check(a7.name == "alice", "bad value");
        check(!a8.a, "bad value");
        printString(`+++test gen code
        ${a1},
        ${a2},
        ${a3},
        ${a4},
        ${a5},
        \n`);
    }

    @action("testgencode2")
    testGenCode2(
        a1: string,
        a2: Asset,
        a3: u64,
        a4: u64[],
        a5: Asset[],
        a6: MyOptional,
        a7: MyData,
        a8: MyExtension,
    ): void {
        check(a6.a == new Asset(10000, new Symbol("EOS", 4)), "bad value");
        check(a7.name == "alice", "bad value");
        check(a8.a == new Asset(120000, new Symbol("EOS", 4)), "bad value");
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
        check(getSender() == this.receiver, "invalid sender");
        printString(`+++goodbye, ${name}\n`);
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        check(getSender() == new Name(), "sender should be empty");
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
