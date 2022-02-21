import { check } from "./system";
import { Encoder, Decoder, Packer } from "./serializer";
import { U128 } from "./bignum";

const MAX_AMOUNT: i64 = (1 << 62) - 1;

export function isValid(sym: u64): bool {
    let i = 0;
    for (; i<7; i++) {
        let c = <u8>(sym & 0xFF);
        // ('A' <= c && c <= 'Z')
        if (c >= <u8>65 && c <= <u8>90) {
            true;
        } else {
            return false;
        }
        sym >>= 8;
        if ((sym & 0xFF) == 0) {
            break;
        }
    }

    i += 1;
    for (; i<7; i++) {
        sym >>= 8;
        if ((sym & 0xFF) != 0) {
            return false;
        }
    }
    return true;
}

export class Symbol implements Packer {
    public value: u64;

    constructor(name: string="", precision: u8=0) {
        check(name.length <= 7, "bad symbol name");
        this.value = 0;
        for (let i=0; i<name.length; i++) {
            let v: u64 = <u64>name.charCodeAt(name.length-1-i);
            check(v >= 65 && v <= 90, "Invalid character");
            this.value <<= 8;
            this.value |= v;
        }
        this.value |= precision;
    }

    static fromU64(value: u64): Symbol {
        let a = new Symbol();
        a.value = value;
        return a;
    }

    fromU64(value: u64): Symbol {
        let ret = new Symbol();
        ret.value = value;
        check(ret.isValid(), "invalid symbol");
        return ret;
    }

    precision(): u8 {
        return <u8>(this.value & 0xFF);
    }

    isValid(): bool {
        let sym = this.code();
        return isValid(sym);
    }

    code(): u64 {
        return this.value >> 8;
    }

    raw(): u64 {
        return this.value;
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
            buf[n] = <u8>(value & 0xFF);
            n += 1;
        }
        return String.UTF8.decode(buf.slice(0, n).buffer);
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
            buf[n] = <u8>(value & 0xFF);
            n += 1;
        }
        return (this.value & 0xFF).toString(10) + "," + this.getSymbolString();
    }

    pack(): u8[] {
        let enc = new Encoder(8);
        enc.packNumber<u64>(this.value);
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.value = dec.unpackNumber<u64>();
        check(this.isValid(), "invalid symbol");
        return dec.getPos();
    }

    getSize(): usize {
        return 8;
    }

    @inline @operator('==')
    static eq(a: Symbol, b: Symbol): bool {
      return a.value == b.value;
    }

    @inline @operator('!=')
    static neq(a: Symbol, b: Symbol): bool {
      return a.value != b.value;
    }

    @inline @operator('<')
    static lt(a: Symbol, b: Symbol): bool {
      return a.value < b.value;
    }
}

export class Asset implements Packer {
    constructor(
        public amount: i64=0,
        public symbol: Symbol=new Symbol()) {
    }

    isAmountWithinRange(): bool {
        return -MAX_AMOUNT <= this.amount && this.amount <= MAX_AMOUNT;
    }

    isValid (): bool {
        return this.isAmountWithinRange() && this.symbol.isValid();
    }

    toString(): string {
        let precision = <i32>(this.symbol.value & 0xFF);
        let div = 10;
        for (let i=0; i<precision; i++) {
            div *= 10;
        }
        return (this.amount/div).toString() + '.' + (this.amount%div).toString().padStart(precision, '0') + " " + this.symbol.getSymbolString();
    }

    pack(): u8[] {
        let enc = new Encoder(8*2);
        enc.packNumber<i64>(this.amount);
        enc.pack(this.symbol);
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.amount = dec.unpackNumber<i64>();
        dec.unpack(this.symbol);
        check(this.isValid(), "invalid asset");
        return dec.getPos();
    }

    getSize(): usize {
        return 16;
    }

    @inline @operator('+')
    static add(a: Asset, b: Asset): Asset {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        let amount: i64 = a.amount + b.amount;
        check(-MAX_AMOUNT <= amount, "addition underflow");
        check(amount <= MAX_AMOUNT, "addition overflow");
        return new Asset(amount, Symbol.fromU64(a.symbol.value));
    }

    @inline @operator('-')
    static sub(a: Asset, b: Asset): Asset {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        let amount = a.amount - b.amount;
        check(amount >= -MAX_AMOUNT, "subtraction underflow");
        check(amount <= MAX_AMOUNT, "subtraction overflow");
        return new Asset(amount, Symbol.fromU64(a.symbol.value));
    }
  
    @inline @operator('*')
    static mul(a: Asset, b: Asset): Asset {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        check(a.amount >= 0, "bad amount");
        check(b.amount >= 0, "bad amount");
        let _a = new U128(<u64>a.amount);
        let _b = new U128(<u64>b.amount);
        let _c = _a * _b;

        let max_amount = new U128(MAX_AMOUNT);
        // let min_amount = new I128(-MAX_AMOUNT);
        check(max_amount > _c, "multiplication overflow");
        // check(_c > min_amount, "multiplication underflow");
        return new Asset(_c.lo, Symbol.fromU64(a.symbol.value));
    }
  
    @inline @operator('/')
    static div(a: Asset, b: Asset): Asset {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        check(a.amount >= 0, "bad amount");
        check(b.amount >= 0, "bad amount");
        return new Asset(a.amount / b.amount, Symbol.fromU64(a.symbol.value));
    }

    @inline @operator('==')
    static eq(a: Asset, b: Asset): bool {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        return a.amount == b.amount;
    }

    @inline @operator('!=')
    static ne(a: Asset, b: Asset): bool {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        return a.amount != b.amount;
    }
  
    @inline @operator('<')
    static lt(a: Asset, b: Asset): bool {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        return a.amount < b.amount;
    }
  
    @inline @operator('>')
    static gt(a: Asset, b: Asset): bool {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        return a.amount > b.amount;
    }
  
    @inline @operator('<=')
    static lte(a: Asset, b: Asset): bool {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        return a.amount <= b.amount;
    }
  
    @inline @operator('>=')
    static gte(a: Asset, b: Asset): bool {
        check(a.symbol.value == b.symbol.value, "symbol not the same");
        return a.amount >= b.amount;
    }
}
