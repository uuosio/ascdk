import {
    Asset,
    Symbol,
    Float128,
    Contract,
    print,
    Utils,
    check,
    Variant,
    Packer,
    VariantValue,
    Encoder,
    Decoder,
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
class MyVariant extends Variant {
    a: u64;
    b: Asset;
}

@variant(nocodegen, noabigen)
class MyVariant2 implements Packer {
    _index: u8;
    value: usize;

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packNumber<u8>(this._index);
        if (this._index == 0) {
            let value = changetype<VariantValue<u64>>(this.value);
            enc.packNumber<u64>(value.value);
        }

        if (this._index == 1) {
            let value = changetype<VariantValue<Asset>>(this.value);
            enc.pack(value.value);
        }

        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this._index = dec.unpackNumber<u8>();
        if (this._index == 0) {
            let innerValue: u64;
            innerValue = dec.unpackNumber<u64>();
            let value = new VariantValue<u64>(innerValue);
            this.value = changetype<usize>(value);
        }

        if (this._index == 1) {
            let innerValue: Asset;
            
            {
                let obj = new Asset();
                dec.unpack(obj);
                innerValue = obj;
            }
            let value = new VariantValue<Asset>(innerValue);
            this.value = changetype<usize>(value);
        }

        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 1;
        if (this._index == 0) {
            let value = changetype<VariantValue<u64>>(this.value);
            size += sizeof<u64>();
        }

        if (this._index == 1) {
            let value = changetype<VariantValue<Asset>>(this.value);
            size += value.value.getSize();
        }

        return size;
    }

    static new<T>(value: T): MyVariant2 {
        let obj = new MyVariant2();
        let v = new VariantValue<T>(value);
        obj.value = changetype<usize>(v);
        if (idof<VariantValue<T>>() == idof<VariantValue<u64>>()) {
            obj._index = 0;
        }

        if (idof<VariantValue<T>>() == idof<VariantValue<Asset>>()) {
            obj._index = 1;
        }

        return obj;
    }

    get<T>(): T {
        
        if (idof<VariantValue<T>>() == idof<VariantValue<u64>>()) {
            check(this._index == 0, "wrong variant type");
        }

        
        if (idof<VariantValue<T>>() == idof<VariantValue<Asset>>()) {
            check(this._index == 1, "wrong variant type");
        }

        let value = changetype<VariantValue<T>>(this.value);
        return value.value;
    }

    is<T>(): bool {
        
        if (idof<VariantValue<T>>() == idof<VariantValue<u64>>()) {
            return this._index == 0;
        }

        
        if (idof<VariantValue<T>>() == idof<VariantValue<Asset>>()) {
            return this._index == 1;
        }

        return false;
    }
}

@contract
class MyContract extends Contract{
    @action("test")
    testVariant(a: MyVariant, b: MyVariant): void {
        check(a.isa(), "a.isa()");
        check(a.is<u64>(), "a.is<u64>()");
        check(a.geta() == 10, "a.geta() == 10");
        check(b.isb(), "b.isb()");
        check(b.is<Asset>(), "b.is<Asset>()");
        check(b.getb() == new Asset(10000, new Symbol("EOS", 4)), 'b.getb() == new Asset(10000, new Symbol("EOS", 4))');
    }

    @action("test2")
    testVariant2(): void {
        let a = MyVariant.new(new Asset(10000, new Symbol("EOS", 4)));
        check(!a.isa(), "!a.isa()");
        check(a.isb(), "a.isb()");

        check(!a.is<u64>(), "!a.is<u64>() 111");
        check(a.is<Asset>(), "a.is<Asset>()");

        let raw = a.pack();
        a.unpack(raw);
        let raw2 = a.pack();
        check(Utils.bytesCmp(raw, raw2) == 0, "bad value");

        let b = MyVariant.new(<u64>11);
        check(b.isa(), "b.isa()");
        check(!b.isb(), "!b.isb()");

        check(b.is<u64>(), "b.is<u64>()");
        check(!b.is<Asset>(), "!b.is<Asset>()");

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
            check(a1.is<i8>(), "bad value 1");
            check(a1.geti8() == 1, "bad value 1");
            check(a1.get<i8>() == 1, "bad value 1");

            check(a2.isi16(), "bad value 2");
            check(a2.is<i16>(), "bad value 2");
            check(a2.geti16() == 2, "bad value 2");
            check(a2.get<i16>() == 2, "bad value 2");

            check(a3.isi32(), "bad value 3");
            check(a3.is<i32>(), "bad value 3");
            check(a3.geti32() == 3, "bad value 3");
            check(a3.get<i32>() == 3, "bad value 3");

            check(a4.isi64(), "bad value 4");
            check(a4.is<i64>(), "bad value 4");
            check(a4.geti64() == 4, "bad value 4");
            check(a4.get<i64>() == 4, "bad value 4");

            check(a5.isu8(), "bad value 5");
            check(a5.is<u8>(), "bad value 5");
            check(a5.getu8() == 5, "bad value 5");
            check(a5.get<u8>() == 5, "bad value 5");

            check(a6.isu16(), "bad value 6");
            check(a6.is<u16>(), "bad value 6");
            check(a6.getu16() == 6, "bad value 6");
            check(a6.get<u16>() == 6, "bad value 6");

            check(a7.isu32(), "bad value 7");
            check(a7.is<u32>(), "bad value 7");
            check(a7.getu32() == 7, "bad value 7");
            check(a7.get<u32>() == 7, "bad value 7");

            check(a8.isu64(), "bad value 8");
            check(a8.is<u64>(), "bad value 8");
            check(a8.getu64() == 8, "bad value 8");
            check(a8.get<u64>() == 8, "bad value 8");

            check(a9.isfloat(), "bad value 9");
            check(a9.is<f64>(), "bad value 9");
            check(a9.getfloat() == 9.9, "bad value 9");
            check(a9.get<f64>() == 9.9, "bad value 9");

            check(a10.isdouble(), "bad value 10");
            check(a10.is<Float128>(), "bad value 10");
            check(a10.getdouble() == new Float128(0xffffffffffffffff, 0xffffffffffffffff), "bad value 10");
            check(a10.get<Float128>() == new Float128(0xffffffffffffffff, 0xffffffffffffffff), "bad value 10");

            check(a11.isstring(), "bad value 11");
            check(a11.is<string>(), "bad value 11");
            check(a11.getstring() == "hello", "bad value 11");

            check(a12.isINT8_VEC(), "bad value 12");
            check(a12.is<i8[]>(), "bad value 12");
            let arr = a12.getINT8_VEC();
            check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 12");
            arr = a12.get<i8[]>();
            check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 12");


            check(a13.isINT16_VEC(), "bad value 13");
            check(a13.is<i16[]>(), "bad value 13");
            {
                let arr = a13.getINT16_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 13");    

                arr = a13.get<i16[]>();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 13");    

            }

            check(a14.isINT32_VEC(), "bad value 14");
            check(a14.is<i32[]>(), "bad value 14");
            {
                let arr = a14.getINT32_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 14");    

                arr = a14.get<i32[]>();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 14");    
            }

            check(a15.isINT64_VEC(), "bad value 15");
            check(a15.is<i64[]>(), "bad value 15");
            {
                let arr = a15.getINT64_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 15");    

                arr = a15.get<i64[]>();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 15");
            }

            check(a16.isUINT8_VEC(), "bad value 16");
            check(a16.is<u8[]>(), "bad value 16");
            {
                let arr = a16.getUINT8_VEC();
                check(arr[0] == 0xaa && arr[1] == 0xbb && arr[2] == 0xcc, "bad value 16");    

                arr = a16.get<u8[]>();
                check(arr[0] == 0xaa && arr[1] == 0xbb && arr[2] == 0xcc, "bad value 16");    
            }

            check(a17.isUINT16_VEC(), "bad value 17");
            check(a17.is<u16[]>(), "bad value 17");
            {
                let arr = a17.getUINT16_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 17");    

                arr = a17.get<u16[]>();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 17");    
            }

            check(a18.isUINT32_VEC(), "bad value 18");
            check(a18.is<u32[]>(), "bad value 18");
            {
                let arr = a18.getUINT32_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 18");    

                arr = a18.get<u32[]>();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 18");    
            }

            check(a19.isUINT64_VEC(), "bad value 19");
            check(a19.is<u64[]>(), "bad value 19");
            {
                let arr = a19.getUINT64_VEC();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 19");    

                arr = a19.get<u64[]>();
                check(arr[0] == 1 && arr[1] == 2 && arr[2] == 3, "bad value 19");    
            }

            check(a20.isFLOAT_VEC(), "bad value 20");
            check(a20.is<f64[]>(), "bad value 20");
            {
                let arr = a20.getFLOAT_VEC();
                check(arr[0] == 1.1 && arr[1] == 2.2 && arr[2] == 3.3, "bad value 20");    

                arr = a20.get<f64[]>();
                check(arr[0] == 1.1 && arr[1] == 2.2 && arr[2] == 3.3, "bad value 20");
            }

            check(a21.isDOUBLE_VEC(), "bad value 21");
            check(a21.is<Float128[]>(), "bad value 21");
            {
                let arr = a21.getDOUBLE_VEC();
                let a1 = new Float128(0xffffffffffffffaa, 0xfaffffffffffffff)
                let a2 = new Float128(0xffffffffffffffff, 0xfbffffffffffffff)
                check(arr[0] == a1 && arr[1] == a2, "bad value 21");

                arr = a21.get<Float128[]>();
                check(arr[0] == a1 && arr[1] == a2, "bad value 21");
            }

            check(a22.isSTRING_VEC(), "bad value 22");
            check(a22.is<string[]>(), "bad value 22");
            {
                let arr = a22.getSTRING_VEC();
                check(arr[0] == "hello" && arr[1] == "world", "bad value 22");    

                arr = a22.get<string[]>();
                check(arr[0] == "hello" && arr[1] == "world", "bad value 22");
            }
        }
}
