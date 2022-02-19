import * as chain from "as-chain"

@packer
class MyData {
    constructor(public a: u64 = 0,
        public b: u64 = 0,
        public c: u64 = 0,
        public d: chain.Asset[] = [],
        ) {
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
        {
            let arr = new Array<MyData>();

            let obj1 = new MyData();
            arr.push(obj1);

            let obj2 = new MyData(1, 2, 3, 
                [new chain.Asset(10, new chain.Symbol("EOS", 4))]
            );
            arr.push(obj2);

            let enc = new chain.Encoder(8*3+1 + 8*3+1+16 + 1);
            enc.packObjectArray(arr);
            
            let data = enc.getBytes();

            arr = new Array<MyData>();
            let dec = new chain.Decoder(data);
            let length = dec.unpackLength();
            for (let i=<u32>0; i<length; i++) {
                let obj = new MyData();
                dec.unpack(obj);
                arr.push(obj);
            }
            chain.assert(arr[1].a == 1 && arr[1].b == 2 && arr[1].c == 3 && arr[1].d[0].amount == 10, "bad value");
            return;
        }

        {
            let arr = new Array<MyData>();

            let obj1 = new MyData();
            arr.push(obj1);

            let obj2 = new MyData(1, 2, 3);
            arr.push(obj2);

            let data = obj2.pack();

            let dec = new chain.Decoder(data);
            dec.unpack(arr[0]);
            chain.assert(obj1.a == 1 && obj1.b == 2 && obj1.c == 3, "bad value");
        }

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
        {
            let a = new chain.Asset(10, new chain.Symbol("EOS", 4));
            let b = new chain.Asset(5, new chain.Symbol("EOS", 4));
            chain.assert( a > b, "a > b");
            chain.assert( b < a, "b > a");
            chain.assert( a != b, "a != b");
            chain.assert( a - b == new chain.Asset(5, new chain.Symbol("EOS", 4)), "bad value");
            chain.assert( a + b == new chain.Asset(15, new chain.Symbol("EOS", 4)), "bad value");
            chain.assert( a / b == new chain.Asset(2, new chain.Symbol("EOS", 4)), "bad value");
            chain.assert( a * b == new chain.Asset(50, new chain.Symbol("EOS", 4)), "bad value");
        }
    }

    @action("test2")
    testSerializer(
        a1: bool,
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
        a32: string[],
    ): void {
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
        a32 = ${a32},
        `)
    }
}
