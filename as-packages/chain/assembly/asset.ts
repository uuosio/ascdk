import { assert } from "./system"
import { Encoder, Decoder, Serializer } from "./serializer"

export class Symbol implements Serializer {
    value: u64;
    constructor(name: string, precision: u8) {
        assert(name.length <= 7, "bad symbol name");
        this.value = 0;
        for (let i=0; i<name.length; i++) {
            let v: u64 = <u64>name.charCodeAt(name.length-1-i);
            assert(v >= 65 && v <= 90, "Invalid character")
            this.value |= v;
            this.value <<= 8;
        }
    }

    serialize(): u8[] {
        let enc = new Encoder(8);
        enc.packNumber<u64>(this.value);
        return enc.getBytes();
    }

    deserialize(data: u8[]): usize {
        let dec = new Decoder(data);
        this.value = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        return 8;
    }
}

export class Asset {
    amount: i64;
    symbol: Symbol;
    constructor(amount: i64, symbol: Symbol) {
        this.amount = amount;
        this.symbol = symbol;
    }

    serialize(): u8[] {
        let enc = new Encoder(8*2);
        enc.packNumber<i64>(this.amount);
        enc.pack(this.symbol);
        return enc.getBytes();
    }

    deserialize(data: u8[]): usize {
        let dec = new Decoder(data);
        this.amount = dec.unpackNumber<i64>();
        dec.unpack(this.symbol);
        return dec.getPos();
    }

    getSize(): usize {
        return 8;
    }
}
