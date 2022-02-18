import * as chain from "as-chain"
import { Utils } from "as-chain/utils"

class TestClass {
    a: u64;
    b: u64;
    c: u64;
    constructor(a: u64, b: u64, c: u64) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

@contract("hello")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("test1")
    testEncodeDecode(): void {
        let n = new chain.VarUint32(0xfff);
        let packed = n.pack();

        let m = new chain.VarUint32(0);
        m.unpack(packed);
        chain.assert(n.n == m.n, "bad value.");

        let enc = new chain.Encoder(10);
        enc.packLength(0xfffff);

        let dec = new chain.Decoder(enc.getBytes());
        let length = dec.unpackLength();
        chain.assert(length == 0xfffff, "bad value");
    }

    @action("test2")
    testSerializer(
        a1: boolean,
        a2: i8,
        a3: u8,
        a4: i16,
        a5: u16,
        a6: i32,
        a7: u32,
        a8: i64,
        a9: u64,
        // a10: i128,
        // a11: u128,
        // a12: VarInt32,
        a13: chain.VarUint32,
        a14: f32,
        a15: f64,
        //a16: f128,
        //a17: TimePoint,
        //a18: TimePointSec,
        //a19: BlockTimestampType,
        a20: chain.Name,
        //a21: u8[],
        a22: string,
        //a23: Checksum160,
        //a24: Checksum256,
        //a25: Checksum512,
        //a26: PublicKey,
        //a27: chain.Signature,
        //a28: chain.Symbol,
        // a29: chain.SymbolCode,
        a30: chain.Asset,
        // a31: chain.ExtendedAsset,
    ): void {
        chain.printString(`++++sizeof<chain.Asset>: ${sizeof<chain.Asset>()}\n`);
        chain.printString(`++++sizeof<chain.Symbol>: ${sizeof<chain.Symbol>()}\n`);
        chain.printString(`++++sizeof<u64>: ${sizeof<u64>()}\n`);
        chain.printString(`++++sizeof<TestClass>: ${sizeof<TestClass>()}\n`);

        let a = new TestClass(1, 2, 3);
        chain.printString(`changetype<ArrayBufferView>(a).byteLength: ${changetype<ArrayBufferView>(a).byteLength}`);
        chain.assert(a13 == new chain.VarUint32(0xfff), "bad a13 value.");
        chain.assert(a20 == chain.Name.fromString("alice"), "bad a20 value");
        chain.printString(`
        a1 = ${a1},
        a2 = ${a2},
        a3 = ${a3},
        a4 = ${a4},
        a5 = ${a5},
        a6 = ${a6},
        a7 = ${a7},
        a8 = ${a8},
        a9 = ${a9.toString(16)},
        a14 = ${a14},
        a15 = ${a15},
        a20 = ${a20},
        a22 = ${a22},
        a30 = ${a30},
        `)
    }
}
