import { Name, MultiIndexValue, printString, action, contract } from "as-chain";

class TestClass {
    a: u64;
    b: u64;
    c: u64;
    constructor(a: u64, b: u64, c: u64) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

class MyData implements MultiIndexValue {

}

@contract("hello")
class MyContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("test1")
    testSerializer(a1: boolean): void {

        for (let i=0; i<10; i++) {
            printString(`${i}: hello,world\n`);
        }
    }
}
