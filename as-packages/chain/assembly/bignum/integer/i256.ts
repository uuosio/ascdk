import { u256 } from './u256';
import { Encoder, Decoder, Packer } from "../../serializer";

export class i256 {
  pack(): u8[] {
    let enc = new Encoder(32);
    enc.packNumber<i64>(this.lo1);
    enc.packNumber<i64>(this.lo2);
    enc.packNumber<i64>(this.hi1);
    enc.packNumber<i64>(this.hi2);
    return enc.getBytes();
  }

  unpack(data: u8[]): usize {
      let dec = new Decoder(data);
      this.lo1 = dec.unpackNumber<i64>();
      this.lo2 = dec.unpackNumber<i64>();
      this.hi1 = dec.unpackNumber<i64>();
      this.hi2 = dec.unpackNumber<i64>();
      return 32;
  }

  getSize(): usize {
      return 32;
  }

  @inline static get Zero(): i256 { return new i256(); }
  @inline static get One():  i256 { return new i256(1); }
  @inline static get Min():  i256 { return new i256(0, 0, 0, 0x8000000000000000); }
  @inline static get Max():  i256 { return new i256(u64.MAX_VALUE, u64.MAX_VALUE, u64.MAX_VALUE, 0x7FFFFFFFFFFFFFFF); }

  constructor(
    public lo1: i64 = 0,
    public lo2: i64 = 0,
    public hi1: i64 = 0,
    public hi2: i64 = 0,
  ) {}

  @inline
  isNeg(): bool {
    return <bool>(this.hi2 >>> 63);
  }

  @inline
  isZero(): bool {
    return !(this.lo1 | this.lo2 | this.hi1 | this.hi2);
  }

  @inline @operator.prefix('!')
  static isEmpty(value: i256): bool {
    return value === null || !value.isZero();
  }

  /*
  @inline
  static abs(value: i128): i128 {
    return value < 0 ? value.neg() : value;
  }
  */

  // TODO
}
