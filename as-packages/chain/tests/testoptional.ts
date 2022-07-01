import * as _chain from "as-chain";
import {
    Symbol,
    Asset,
    Optional,
    OptionalNumber,
    OptionalString,

    Contract,
    check
} from "as-chain";

class MyClass {
    a1: Optional<Asset>;
    a2: OptionalNumber<u64>;
    a3: OptionalString;
    constructor(a1: Asset | null = null, a2: u64 = 0, a3: string="") {
        this.a1 = new Optional<Asset>(a1);
        this.a2 = new OptionalNumber<u64>(a2);
        this.a3 = new OptionalString(a3);
    }
}


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
        a5: MyClass,
        a6: OptionalNumber<u64>,
        a7: OptionalString,
        a8: OptionalNumber<u64>,
        a9: OptionalString,
    ): void {
        check(!a1.value, "bad value 1");
        check(a2.value == new Asset(10000, new Symbol("EOS", 4)), "bad value 2");
        check(a3.value!.a == 1234, "bad value 3");
        check(a4.value == new Asset(40000, new Symbol("EOS", 4)), "bad value 4");
        check(a5.a1.value == new Asset(50000, new Symbol("EOS", 4)), "bad value a5.a1");
        check(a5.a2.value == 123, "bad value a5.a2");
        check(a5.a3.value == "hello", "bad value a5.a3");
        check(a6.value == 123, "bad value 6");
        check(a7.value == "hello", "bad value ");
        check(!a8.hasValue, "bad value ");
        check(!a9.hasValue, "bad value ");
        {
            let a5 = new Optional<Asset>(new Asset(10000, new Symbol("EOS", 4)));
            let data = a5.pack();
            let a6 = new Optional<Asset>();
            a6.unpack(data);
            check(a5.value! == a6.value!, "bad value 5");    
        }

        {
            let a = new OptionalNumber<u8>(0, false);
            check(!a.hasValue, "bad value a 1");
            //unpack, this time hasValue should return `true`
            a.unpack([1, 0]);
            check(a.hasValue, "bad value a 2");
        }
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
