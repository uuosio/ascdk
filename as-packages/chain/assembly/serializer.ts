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
  
    packU32(n: u32): void {
        store<u32>(changetype<ArrayBufferView>(this.buf).dataStart + this.pos, n);
        this.pos += 4;
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
  
    unpackU32(): u32 {
      return load<u32>(changetype<ArrayBufferView>(this.buf).dataStart + this.pos)
    }
}

  