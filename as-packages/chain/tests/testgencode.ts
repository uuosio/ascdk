import {
    Asset,

    Contract,
} from "as-chain";

class MyData2 {
    public name!: string
    public asset!: Asset
}

class MyData {
    public data!: MyData2;
}

@table("hello", "singleton")
class MyTable {
    aaa: u64;
    bbb: u64;
    constructor(
        aaa: u64 = 0,
        bbb: u64 = 0
    ){
        this.aaa = aaa;
        this.bbb = bbb;
    }
}

@contract
class MyContract extends Contract {
    @action("testgencode")
    testGenCode(
        a1: MyData,
        a2: MyTable,
    ): void {

    }
}
