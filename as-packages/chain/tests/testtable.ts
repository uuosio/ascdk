import { Asset, Contract, primary, contract, table, action } from "as-chain";

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
class MyContract extends Contract{
    @action("testtable")
    testTable(): void {
        let mi = MyTable.new(this.receiver, this.receiver);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
