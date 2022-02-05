import { Name } from "./name"
import { memcpy } from "./env"
import { check } from "./system"

export interface Serializer {
    serialize(): u8[];
    deserialize(data: u8[]): usize;
    getSize(): usize;
}

export class Encoder {
    buf: Array<u8>;
    pos: usize;
  
    constructor(bufferSize: u32) {
        this.buf = new Array(bufferSize);
    }

    checkPos(n: usize): void {
        check(this.pos + n <= <u32>this.buf.length, "incPos: buffer overflow");
    }
    
    incPos(n: usize): void {
        this.pos += n;
        check(this.pos <= <u32>this.buf.length, "incPos: buffer overflow");
    }

    pack(ser: Serializer): usize {
        let raw = ser.serialize();
        return this.packBytes(raw);
    }

    packBytes(arr: u8[]): usize {
        let dataSize = arr.length;
        this.checkPos(dataSize);
        let src = arr.dataStart;
        let pos = this.pos;
        this.incPos(dataSize);
        let dest = this.buf.dataStart + pos;
        memcpy(dest, src, dataSize);
        return dataSize;
    }

    packArray<T>(arr: T[]): usize {
        let lengthBytes = this.packLength(arr.length);
        let dataSize = sizeof<T>()*arr.length;
        let src = arr.dataStart;
        let pos = this.pos;
        this.incPos(dataSize);
        let dest = this.buf.dataStart + pos;
        memcpy(dest, src, dataSize);
        return lengthBytes + dataSize;
    }

    packNumber<T>(n: T): usize {
        let pos = this.pos;
        let size = sizeof<T>();
        this.incPos(size);
        store<T>(this.buf.dataStart + pos, n);
        return size;
    }

    packName(n: Name): usize {
        this.packNumber<u64>(n.N);
        return 8;
    }
    
    packLength(n: u32): usize {
        return this.packNumber<u8>(<u8>n);
    }

    packString(s: string): usize {
        let utf8Str = String.UTF8.encode(s);
        let packedLength = this.packLength(utf8Str.byteLength);
//        let view = new DataView(utf8Str);
        let src = changetype<usize>(utf8Str);
        let dest = this.buf.dataStart + this.pos;
        this.incPos(utf8Str.byteLength);
        memcpy(dest, src, utf8Str.byteLength);
        return packedLength + utf8Str.byteLength;
    }

    getBytes(): u8[] {
        return this.buf.slice(0, <i32>this.pos);
    }
}

export class Decoder {
    buf: u8[];
    pos: u32;
  
    constructor(buf: u8[]) {
      this.buf = buf;
      this.pos = 0;
    }
    
    remains(): u8[] {
        return this.buf.slice(this.pos, this.buf.length);
    }

    incPos(n: u32): void {
        this.pos += n
        check(this.pos <= <u32>this.buf.length, "incPos: buffer overflow")
    }

    getPos(): u32 {
        return this.pos;
    }

    unpack(ser: Serializer): usize {
        let size = ser.deserialize(this.remains())
        this.incPos(<u32>size);
        return size;
    }

    unpackNumber<T>(): T {
      let value = load<T>(this.buf.dataStart + this.pos)
      this.incPos(sizeof<T>());
      return value;
    }

    unpackName(): Name {
        let n = this.unpackNumber<u64>()
        return new Name(n);
    }

    unpackLength(): u32 {
        return this.unpackNumber<u8>();
    }

    unpackBytes(size: usize): u8 {
        let arr = new Array<u8>(size);
        let dest = arr.dataStart;
        let src = this.buf.dataStart + this.pos;
        memcpy(dest, src, size);
        return arr;
    }

    unpackString(): string {
        let length = this.unpackLength();
        let rawStr = this.buf.slice(this.pos, this.pos + length);
        this.incPos(length);
        return String.UTF8.decode(rawStr.buffer);
    }
}
