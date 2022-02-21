import * as env from "./env";
import { Packer, Encoder, Decoder } from "./serializer"

export declare function eosio_assert_message(test: u32, msg_ptr: usize, msg_len: usize): void;

export function assert(test: bool, msg: string): void {
    let s1 = String.UTF8.encode(msg);
    let dv = new DataView(s1);
    let _test = test ? 1 : 0;
    env.eosio_assert_message(_test, dv.dataStart, msg.length);
}

export function check(test: bool, msg: string): void {
    assert(test, msg);
}

// time in ns
export class TimePoint implements Packer {

    constructor(public elapsed: u64 = 0){}

    toString(): string {
        return `${this.elapsed}`;
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packNumber<u64>(this.elapsed);
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.elapsed = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        return 8;
    }

    @inline @operator('+')
    static add(a: TimePoint, b: TimePoint): TimePoint {
        return new TimePoint(a.elapsed + b.elapsed);
    }

    @inline @operator('-')
    static sub(a: TimePoint, b: TimePoint): TimePoint {
        return new TimePoint(a.elapsed - b.elapsed);
    }
  
    @inline @operator('*')
    static mul(a: TimePoint, b: TimePoint): TimePoint {
        return new TimePoint(a.elapsed * b.elapsed);
    }
  
    @inline @operator('/')
    static div(a: TimePoint, b: TimePoint): TimePoint {
        return new TimePoint(a.elapsed / b.elapsed);
    }

    @inline @operator('==')
    static eq(a: TimePoint, b: TimePoint): bool {
        return a.elapsed == b.elapsed;
    }

    @inline @operator('!=')
    static neq(a: TimePoint, b: TimePoint): bool {
        return a.elapsed != b.elapsed;
    }
  
    @inline @operator('<')
    static lt(a: TimePoint, b: TimePoint): bool {
        return a.elapsed < b.elapsed;
    }
  
    @inline @operator('>')
    static gt(a: TimePoint, b: TimePoint): bool {
        return a.elapsed > b.elapsed;
    }
  
    @inline @operator('<=')
    static lte(a: TimePoint, b: TimePoint): bool {
        return a.elapsed <= b.elapsed;
    }
  
    @inline @operator('>=')
    static gte(a: TimePoint, b: TimePoint): bool {
        return a.elapsed >= b.elapsed;
    }
}

// time in ns
export class TimePointSec implements Packer {

    constructor(public UTCSeconds: u32 = 0) {}

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packNumber<u32>(this.UTCSeconds);
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.UTCSeconds = dec.unpackNumber<u32>();
        return dec.getPos();
    }

    getSize(): usize {
        return 4;
    }

    @inline @operator('+')
    static add(a: TimePointSec, b: TimePointSec): TimePointSec {
        return new TimePointSec(a.UTCSeconds + b.UTCSeconds);
    }

    @inline @operator('-')
    static sub(a: TimePointSec, b: TimePointSec): TimePointSec {
        return new TimePointSec(a.UTCSeconds - b.UTCSeconds);
    }
  
    @inline @operator('*')
    static mul(a: TimePointSec, b: TimePointSec): TimePointSec {
        return new TimePointSec(a.UTCSeconds * b.UTCSeconds);
    }
  
    @inline @operator('/')
    static div(a: TimePointSec, b: TimePointSec): TimePointSec {
        return new TimePointSec(a.UTCSeconds / b.UTCSeconds);
    }

    @inline @operator('==')
    static eq(a: TimePointSec, b: TimePointSec): bool {
        return a.UTCSeconds == b.UTCSeconds;
    }

    @inline @operator('!=')
    static neq(a: TimePointSec, b: TimePointSec): bool {
        return a.UTCSeconds != b.UTCSeconds;
    }
  
    @inline @operator('<')
    static lt(a: TimePointSec, b: TimePointSec): bool {
        return a.UTCSeconds < b.UTCSeconds;
    }
  
    @inline @operator('>')
    static gt(a: TimePointSec, b: TimePointSec): bool {
        return a.UTCSeconds > b.UTCSeconds;
    }
  
    @inline @operator('<=')
    static lte(a: TimePointSec, b: TimePointSec): bool {
        return a.UTCSeconds <= b.UTCSeconds;
    }
  
    @inline @operator('>=')
    static gte(a: TimePointSec, b: TimePointSec): bool {
        return a.UTCSeconds >= b.UTCSeconds;
    }
}

export function currentTimeNS(): u64 {
    return env.current_time()
}

export function currentTimeMS(): u64 {
    return env.current_time() / 1000;
}

export function currentTimeSec(): u64 {
    return env.current_time() / 1000000;
}
