import {
    Asset,
    Symbol,

    Checksum256,
    Contract,
    primary,
    contract,
    table,
    action,
    print,
    printHex,
    Utils,
    check,
} from "as-chain";

@variant
class MyVariant {
    a: u64;
    b: Asset | null;
}

@contract("hello")
class MyContract extends Contract{
    @action("test")
    testVariant(a: MyVariant, b: MyVariant): void {
        check(a.isa(), "a.isa()");
        check(a.geta() == 10, "a.geta() == 10");
        check(b.isb(), "b.isb()");
        check(b.getb() == new Asset(10000, new Symbol("EOS", 4)), 'b.getb() == new Asset(10000, new Symbol("EOS", 4))');
    }

    @action("test2")
    testVariant2(): void {
        let a = MyVariant.new<Asset>();
        check(!a.isa(), "!a.isa()");
        check(a.isb(), "a.isb()");

        a.b = new Asset(10000, new Symbol("EOS", 4));

        let raw = a.pack();
        a.unpack(raw);
        let raw2 = a.pack();
        check(Utils.bytesCmp(raw, raw2) == 0, "bad value");

        let b = MyVariant.new<u64>();
        check(b.isa(), "b.isa()");
        check(!b.isb(), "!b.isb()");
        b.geta();
        b.a = 11;
        raw = b.pack();
        b.unpack(raw);
        raw2 = b.pack();
        check(Utils.bytesCmp(raw, raw2) == 0, "bad value");
        print(`${a._index}`);
        print(`${b._index}`);
    }
}
