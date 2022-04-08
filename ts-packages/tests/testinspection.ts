import {
    Asset,
    Symbol,
    print,
    check,
    Contract,
} from "as-chain";

class MyData2 {
    public name!: string
    public asset!: Asset
}

class MyData {
    public data!: MyData2;
}

@table("hello", singleton)
class MyTable {
    a: u64;
    b!: MyData;
}

@contract
class MyContract extends Contract {
    @action("testgencode")
    testGenCode(
        a1: MyData,
        a2: MyTable,
    ): void {
        // a1={"data": {"name":"hello", "asset": "1.0000 EOS"}},
        // a2={"a": 123, "b": {"data": {"name":"hello", "asset": "1.0000 EOS"}}}
        check(a1.data.name == "hello", "test 1");
        check(a1.data.asset == new Asset(10000, new Symbol("EOS", 4)), "test 2");

        check(a2.a == 123, "test 3");
        check(a2.b.data.name == "hello", "test 4");
        check(a2.b.data.asset == new Asset(10000, new Symbol("EOS", 4)), "test 5");
    }
}
