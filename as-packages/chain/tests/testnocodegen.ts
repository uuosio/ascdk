import {
    Asset,
    Encoder,
    Decoder,
    Packer,
    Contract,
} from "as-chain";

import * as _chain from "as-chain";

class MyData implements Packer {
    
    public a: u64
    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packNumber<u64>(this.a);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.a = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        return size;
    }
}

class MyTableDB extends _chain.MultiIndex<MyTable> {

}

@table("hello", "singleton")
class MyTable implements _chain.MultiIndexValue {
    
    aaa: u64;
    bbb: u64;
    constructor(
        aaa: u64 = 0,
        bbb: u64 = 0
    ){
        this.aaa = aaa;
        this.bbb = bbb;
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.aaa);
        enc.packNumber<u64>(this.bbb);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.aaa = dec.unpackNumber<u64>();
        this.bbb = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += sizeof<u64>();
        return size;
    }

    getPrimaryValue(): u64 {
        return _chain.Name.fromU64(0x6AA31A0000000000).N;
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        switch (i) {
            default:
                _chain.assert(false, "bad db index!");
                return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
        }
    }

    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        switch (i) {
            default:
                _chain.assert(false, "bad db index!");
        }
    }

    static new(code: _chain.Name, scope: _chain.Name): _chain.Singleton<MyTable> {
        let tableName = _chain.Name.fromU64(0x6AA31A0000000000);
        return new _chain.Singleton<MyTable>(code, scope, tableName);
    }
}

@contract
class MyContract extends Contract {
    @action("testnogen")
    testNoGenCode(
        a1: MyData,
        a2: MyTable,
    ): void {

    }
}
