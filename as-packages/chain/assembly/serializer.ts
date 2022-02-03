import { Name } from "./name"

export abstract class Serializer {
    abstract serialize(): u8[];
    abstract deserialize(data: u8[]): void;
}
  
export class Encoder {
    buf: Array<u8>;
    pos: u32;
  
    constructor(bufferSize: u32) {
        this.buf = new Array(bufferSize);
    }
  
    packNumber<T>(n: T): void {
        store<u32>(changetype<ArrayBufferView>(this.buf).dataStart + this.pos, n);
        this.pos += 4;
    }

    packName(n: Name): void {
        this.pack<u64>(n.N);
    }
  
    getBytes(): u8[] {
        return this.buf.slice(0, this.pos);
    }
}
  
export class Decoder {
    buf: u8[];
    pos: u32;
  
    constructor(buf: u8[]) {
      this.buf = buf;
      this.pos = 0;
    }
  
    unpackNumber<T>(): T {
      let value = load<T>(changetype<ArrayBufferView>(this.buf).dataStart + this.pos)
      this.pos += sizeof<T>();
      return value;
    }

    unpackName(): Name {
        let n = this.unpack<u64>()
        return new Name(n);
    }
}

  