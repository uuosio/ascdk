import * as chain from "as-chain"
import { Utils } from "as-chain/utils"

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

    @action("test1")
    testSerializer(): void {
    }
}
