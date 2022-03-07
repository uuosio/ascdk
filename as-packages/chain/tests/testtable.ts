import { Asset, Contract, primary, contract, table, action, Table } from "as-chain";

@table("mytable")
class MyTable extends Table {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: Asset = new Asset()
    ) {
        super();
    }

    @primary
    get getPrimary(): u64 {
        return this.a;
    }
}

@contract("hello")
class MyContract extends Contract{
    @action("testtable")
    testTable(): void {
        let mi = MyTable.new<MyTable>(this.receiver, this.receiver);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
