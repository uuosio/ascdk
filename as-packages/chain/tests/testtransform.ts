import * as _chain from "as-chain";
import {
    Asset,
    Symbol,
    Name,
    Action,
    PermissionLevel,
    printString,
    check,
    getSender,
    Contract,
    unpackActionData,
    readActionData,
} from "as-chain";


@packer(nocodegen)
class MyData implements _chain.Packer {
    
    constructor(
        public name: string
    ){}
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packString(this.name);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.name = dec.unpackString();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += _chain.Utils.calcPackedStringLength(this.name);
        return size;
    }
}


@packer(nocodegen)
class MyClass implements _chain.Packer {
    
    aaa!: u64;
    bbb: u64 | null;
    constructor(
        aaa: u64,
        bbb: u64
    ){
        this.aaa = aaa;
        this.bbb = bbb;
    }
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.aaa);
        
        if (!this.bbb) {
            _chain.check(false, "bbb can not be null");
        }
        enc.packNumber<u64>(this.bbb!);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.aaa = dec.unpackNumber<u64>();
        this.bbb = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        
        if (!this.bbb) {
            _chain.check(false, "bbb can not be null");
        }
        size += sizeof<u64>();
        return size;
    }
}


export function apply(receiver: u64, firstReceiver: u64, action: u64): void {
	let _receiver = new Name(receiver);
	let _firstReceiver = new Name(firstReceiver);
	let _action = new Name(action);
}
