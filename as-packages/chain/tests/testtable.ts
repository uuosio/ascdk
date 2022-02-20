import { Name, Asset, MultiIndex } from "as-chain"

@table("mytable")
class MyTable {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: Asset = new Asset()
    ) {}

    @primary
    get getPrimary(): u64 {
        return this.a;
    }
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

    @action("testtable")
    testTable(): void {
        let mi = MyTable.new(this.receiver, this.receiver);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
