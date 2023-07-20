import {
    Name,
    Table,
    U128,
    U256,

    printString,
    printHex,
    check,
    Contract,
    print,
} from "asm-chain";

@table("mydata")
class MyData extends Table {
    constructor(
        public a: u64=0,
        public b: U256=new U256(0)
    ) {
        super();
    }

    @primary
    get getPrimary(): u64 {
        return this.a;
    }

    @secondary
    get bvalue(): U256 {
        return this.b;
    }

    @secondary
    set bvalue(value: U256) {
        this.b = value;
    }
}

@contract
class MyContract extends Contract{

    @action("teststore")
    testStore(key: u64, value: U256): void {
        let mi = MyData.new(this.receiver);

        let mydata = new MyData(key, value);
        mi.store(mydata, this.receiver);
    }
}
