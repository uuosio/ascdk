import {
    Symbol,
    Asset,
    Optional,

    Contract,
    check
} from "as-chain";

@packer
class MyData {
    constructor(
        public a: u64 = 0
    ){}
}

@contract
class MyContract extends Contract {
    @action("testopt")
    testOptional(
        a1: Optional<Asset>,
        a2: Optional<Asset>,
        a3: Optional<MyData>,
        a4: Optional<Asset>,
    ): void {
        check(!a1.value, "bad value 1");
        check(a2.value == new Asset(10000, new Symbol("EOS", 4)), "bad value 2");
        check(a3.value!.a == 1234, "bad value 3");
        check(a4.value == new Asset(40000, new Symbol("EOS", 4)), "bad value 4");
        let a5 = new Optional<Asset>(new Asset(10000, new Symbol("EOS", 4)));
        let data = a5.pack();
        let a6 = new Optional<Asset>();
        a6.unpack(data);
        check(a5.value! == a6.value!, "bad value 5");
    }

    @action("testopt2")
    testOptional2(
        a1: Optional<Asset>,
        a2: Optional<Asset>,
        a3: Optional<MyData>,
        a4: Optional<Asset>,
    ): void {
        check(!a1.value, "bad value 1");
        check(a2.value == new Asset(10000, new Symbol("EOS", 4)), "bad value 2");
        check(!a3.value, "bad value 3");
        check(a4.value == new Asset(40000, new Symbol("EOS", 4)), "bad value 4");
    }
}
