import { Name, Asset, MultiIndex, primary, contract, table, action } from "as-chain"

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
        let newObj = (): MyTable => {
            return new MyTable();
        }

        let mi = new MultiIndex<MyTable>(this.receiver, this.firstReceiver, Name.fromString("mytable"), [], newObj);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
