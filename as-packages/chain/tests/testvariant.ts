import {
    Asset,
    Symbol,
    Float128,

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
class ATOMIC_ATTRIBUTE {
    i8: i8;
    i16: i16;
    i32: i32;
    i64: i64;
    u8: u8;
    u16: u16;
    u32: u32;
    u64: u64;
    float: f64;
    double: Float128;
    string: string = "";
    INT8_VEC: i8[];
    INT16_VEC: i16[] ;
    INT32_VEC: i32[];
    INT64_VEC: i64[];
    UINT8_VEC: u8[];
    UINT16_VEC: u16[];
    UINT32_VEC: u32[];
    UINT64_VEC: u64[];
    FLOAT_VEC: f64[];
    DOUBLE_VEC: Float128[];
    STRING_VEC: string[];
}

@variant
class MyVariant {
    a: u64;
    b: Asset;
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
        let a = MyVariant.new(new Asset(10000, new Symbol("EOS", 4)));
        check(!a.isa(), "!a.isa()");
        check(a.isb(), "a.isb()");

        let raw = a.pack();
        a.unpack(raw);
        let raw2 = a.pack();
        check(Utils.bytesCmp(raw, raw2) == 0, "bad value");

        let b = MyVariant.new(<u64>11);
        check(b.isa(), "b.isa()");
        check(!b.isb(), "!b.isb()");
        b.geta();

        raw = b.pack();
        b.unpack(raw);
        raw2 = b.pack();
        check(Utils.bytesCmp(raw, raw2) == 0, "bad value");
        print(`${a._index}`);
        print(`${b._index}`);
    }

    @action("test3")
    testVariant3(
        a1: ATOMIC_ATTRIBUTE,
        a2: ATOMIC_ATTRIBUTE,
        a3: ATOMIC_ATTRIBUTE,
        a4: ATOMIC_ATTRIBUTE,
        a5: ATOMIC_ATTRIBUTE,
        a6: ATOMIC_ATTRIBUTE,
        a7: ATOMIC_ATTRIBUTE,
        a8: ATOMIC_ATTRIBUTE,
        a9: ATOMIC_ATTRIBUTE,
        a10: ATOMIC_ATTRIBUTE,
        a11: ATOMIC_ATTRIBUTE,
        a12: ATOMIC_ATTRIBUTE,
        a13: ATOMIC_ATTRIBUTE,
        a14: ATOMIC_ATTRIBUTE,
        a15: ATOMIC_ATTRIBUTE,
        a16: ATOMIC_ATTRIBUTE,
        a17: ATOMIC_ATTRIBUTE,
        a18: ATOMIC_ATTRIBUTE,
        a19: ATOMIC_ATTRIBUTE,
        a20: ATOMIC_ATTRIBUTE,
        a21: ATOMIC_ATTRIBUTE,
        a22: ATOMIC_ATTRIBUTE
        ): void {
            check(a1.isi8(), "bad value 1");
            check(a1.geti8() == 1, "bad value 1");

            check(a2.isi16(), "bad value 2");
            check(a2.geti16() == 2, "bad value 2");

            check(a3.isi32(), "bad value 3");
            check(a3.geti32() == 3, "bad value 3");

            check(a4.isi64(), "bad value 4");
            check(a4.geti64() == 4, "bad value 4");

            check(a5.isu8(), "bad value 5");
            check(a5.getu8() == 5, "bad value 5");

            check(a6.isu16(), "bad value 6");
            check(a6.getu16() == 6, "bad value 6");

            check(a7.isu32(), "bad value 7");
            check(a7.getu32() == 7, "bad value 7");

            check(a8.isu64(), "bad value 8");
            check(a8.getu64() == 8, "bad value 8");

            check(a9.isfloat(), "bad value 9");
            check(a9.getfloat() == 9.9, "bad value 9");
            check(a10.isdouble(), "bad value 10");
            check(a10.getdouble() == new Float128(0xffffffffffffffff, 0xffffffffffffffff), "bad value 10");

            check(a11.isstring(), "bad value 11");
            check(a11.getstring() == "hello", "bad value 11");

            check(a12.isINT8_VEC(), "bad value 12");
            let arr = a12.getINT8_VEC();
            check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 12");

            check(a13.isINT16_VEC(), "bad value 13");
            {
                let arr = a13.getINT16_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 13");    
            }

            check(a14.isINT32_VEC(), "bad value 14");
            {
                let arr = a14.getINT32_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 14");    
            }

            check(a15.isINT64_VEC(), "bad value 15");
            {
                let arr = a15.getINT64_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 15");    
            }

            check(a16.isUINT8_VEC(), "bad value 16");
            {
                let arr = a16.getUINT8_VEC();
                check(arr[0] == 0xaa && arr[1] == 0xbb && arr[2] == 0xcc, "bad value 16");    
            }

            check(a17.isUINT16_VEC(), "bad value 17");
            {
                let arr = a17.getUINT16_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 17");    
            }

            check(a18.isUINT32_VEC(), "bad value 18");
            {
                let arr = a18.getUINT32_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 18");    
            }
            check(a19.isUINT64_VEC(), "bad value 19");
            {
                let arr = a19.getUINT64_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 19");    
            }

            check(a20.isFLOAT_VEC(), "bad value 20");
            {
                let arr = a20.getFLOAT_VEC();
                check(arr[0] == 1.1 && arr[1] == 2.2 && arr[2] == 3.3, "bad value 20");    
            }

            check(a21.isDOUBLE_VEC(), "bad value 21");
            {
                let arr = a21.getDOUBLE_VEC();
                let a1 = new Float128(0xffffffffffffffaa, 0xfaffffffffffffff)
                let a2 = new Float128(0xffffffffffffffff, 0xfbffffffffffffff)
                check(arr[0] == a1 && arr[1] == a2, "bad value 21");
            }

            check(a22.isSTRING_VEC(), "bad value 22");
            {
                let arr = a22.getSTRING_VEC();
                check(arr[0] == "hello" && arr[1] == "world", "bad value 22");    
            }
        }
}
