import * as chain from "as-chain"

@table("mydata")
class MyData {
    primary: u64;
    count: u64;
    
    @primary
    getPrimary(): u64 {

    }

    @secondary
    getByCount(): u64 {

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

    @message("inccc", notify=true)
    inc(n: u32, m: u32): void {
        // let v = this.stored.value;
        // this.stored.value = ++v;
    }

    @message("dec")
    dec(n: u32, m: u32): u32 {
        return 0;
    }

    @message("dec2")
    dec2(n: u32, m: u32): void {
        chain.printui(n);
        chain.printString(" ");
        chain.printui(m);
    }

    @message("zzzzzzzzzzzz")
    fullname(n: u32, m: u32): void {
        chain.printString("fullname test:");
        chain.printui(n);
        chain.printString(":");
        chain.printui(m);
    }
}
