import { check } from "./system"
import { Encoder, Decoder, Serializer } from "./serializer"

export class Symbol implements Serializer {
    value: u64;
    constructor(name: string="", precision: u8=0) {
        check(name.length <= 7, "bad symbol name");
        this.value = 0;
        for (let i=0; i<name.length; i++) {
            let v: u64 = <u64>name.charCodeAt(name.length-1-i);
            check(v >= 65 && v <= 90, "Invalid character")
            this.value |= v;
            this.value <<= 8;
        }
        this.value |= precision;
    }

    getSymbolString(): string {
        let buf = new Array<u8>(7);
        let n: i32 = 0;
        let value = this.value;
        for (;;) {
            value >>= 8;
            if (value == 0) {
                break;
            }
            buf[n] = <u8>(value & 0xff);
            n += 1;
        }
        return String.UTF8.decode(buf.slice(0, n).buffer)
    }

    toString(): string {
        let buf = new Array<u8>(7);
        let n: i32 = 0;
        let value = this.value;
        for (;;) {
            value >>= 8;
            if (value == 0) {
                break;
            }
            buf[n] = <u8>(value & 0xff);
            n += 1;
        }
        return (this.value & 0xff).toString(10) + "," + this.getSymbolString();
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

export class Asset implements Serializer {
    amount: i64;
    symbol: Symbol;
    constructor(amount: i64=0, symbol: Symbol=new Symbol()) {
        this.amount = amount;
        this.symbol = symbol;
    }

    Add(b: Asset): Asset {
        check(this.symbol.value == b.symbol.value, "symbol not the same");
        this.amount += b.amount;
        return this;
    }

    Sub(b: Asset): Asset {
        check(this.symbol.value == b.symbol.value, "symbol not the same");
        this.amount -= b.amount;
        return this;
    }

    toString(): string {
        let precision = <i32>(this.symbol.value & 0xff);
        let div = 10;
        for (let i=0; i<precision; i++) {
            div *= 10;
        }
        return (this.amount/div).toString() + '.' + (this.amount%div).toString().padStart(precision, '0') + " " + this.symbol.getSymbolString();
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
