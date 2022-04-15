import {
    Asset,
    Symbol,
    Name,
    Action,
    PermissionLevel,
    printString,
    check,
    getSender,
    Contract,
    unpackActionData,
} from "as-chain";

@packer
class MyData {
    constructor(
        public name: string
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


@contract
class MyContract extends Contract {
    @action("testgencode")
    testGenCode(
        a1: string,
        a2: Asset,
        a3: u64,
        a4: u64[],
        a5?: Asset[],
    ): void {
        printString(`+++test gen code
        ${a1},
        ${a2},
        ${a3},
        ${a4},
        ${a5},
        \n`);
        // a1 = 'hello',
        // a2 = '1.0000 EOS',
        // a3 = 12345,
        // a4 = [1, 2, 3],
        // a5 = ['1.0001 EOS', '2.0002 EOS'],
        check(a1 == 'hello', "");
        check(a2 == new Asset(10000, new Symbol("EOS", 4)), "");
        check(a3 == 12345, "");
        check(a4[0] == 1 && a4[1] == 2 && a4[2] == 3, "");
        check(a5[0] == new Asset(10001, new Symbol("EOS", 4)) &&
            a5[1] == new Asset(20002, new Symbol("EOS", 4)), "");

{
    let t = unpackActionData<testGenCodeAction>();
    check(t.a1 == 'hello', "");
    check(t.a2 == new Asset(10000, new Symbol("EOS", 4)), "");
    check(t.a3 == 12345, "");
    check(t.a4![0] == 1 && t.a4![1] == 2 && t.a4![2] == 3, "");
    check(t.a5![0] == new Asset(10001, new Symbol("EOS", 4)) &&
        t.a5![1] == new Asset(20002, new Symbol("EOS", 4)), "");
}
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
