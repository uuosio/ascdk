import * as chain from "as-chain"

@table("mytable")
class MyTable {
    constructor(
        public a: u64=0,
        public b: u64=0,
    ) {}

    @primary
    get getPrimary(): u64 {
        return this.a;
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

    @action("testtable")
    testTable(): void {
        let newObj = (): MyTable => {
            return new MyTable();
        }

        let mi = new chain.MultiIndex<MyTable>(this.receiver, this.firstReceiver, chain.Name.fromString("mytable"), [], newObj);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
