import * as chain from "as-chain"
import { Utils } from "as-chain/utils"

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
        // a13: VarUint32,
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
