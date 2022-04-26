import * as _chain from "as-chain";
import {
    Name,
    PublicKey,
    PermissionLevel,
    U128,
} from "as-chain"


@packer(nocodegen)
class KeyWeight implements _chain.Packer {
    
    constructor(
        public key: PublicKey = new PublicKey(),
        public weight: u16 = 0
    ){

    }
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.key);
        enc.packNumber<u16>(this.weight);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new PublicKey();
            dec.unpack(obj);
            this.key = obj;
        }
        this.weight = dec.unpackNumber<u16>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.key.getSize();
        size += sizeof<u16>();
        return size;
    }
}


@packer(nocodegen)
export class PermissionLevelWeight implements _chain.Packer {
    
    constructor(
        public permission: PermissionLevel = new PermissionLevel(),
        public weight: u16 = 0
    ){

    }
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.permission);
        enc.packNumber<u16>(this.weight);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new PermissionLevel();
            dec.unpack(obj);
            this.permission = obj;
        }
        this.weight = dec.unpackNumber<u16>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.permission.getSize();
        size += sizeof<u16>();
        return size;
    }
}


@packer(nocodegen)
export class WaitWeight implements _chain.Packer {
    
	waitSec: u16
	weight:  u16
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u16>(this.waitSec);
        enc.packNumber<u16>(this.weight);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.waitSec = dec.unpackNumber<u16>();
        this.weight = dec.unpackNumber<u16>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u16>();
        size += sizeof<u16>();
        return size;
    }
}


@packer(nocodegen)
export class Authority implements _chain.Packer {
    
    constructor(
        public threshold: u32 = 0,
        public keys: KeyWeight[] = new Array<KeyWeight>(),
        public accounts: PermissionLevelWeight[] = new Array<PermissionLevelWeight>(),
        public waits: WaitWeight[] = new Array<WaitWeight>()
        ) {
    }
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u32>(this.threshold);
        enc.packObjectArray(this.keys);
        enc.packObjectArray(this.accounts);
        enc.packObjectArray(this.waits);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.threshold = dec.unpackNumber<u32>();
        
    {
        let length = <i32>dec.unpackLength();
        this.keys = new Array<KeyWeight>(length)
        for (let i=0; i<length; i++) {
            let obj = new KeyWeight();
            this.keys[i] = obj;
            dec.unpack(obj);
        }
    }

        
    {
        let length = <i32>dec.unpackLength();
        this.accounts = new Array<PermissionLevelWeight>(length)
        for (let i=0; i<length; i++) {
            let obj = new PermissionLevelWeight();
            this.accounts[i] = obj;
            dec.unpack(obj);
        }
    }

        
    {
        let length = <i32>dec.unpackLength();
        this.waits = new Array<WaitWeight>(length)
        for (let i=0; i<length; i++) {
            let obj = new WaitWeight();
            this.waits[i] = obj;
            dec.unpack(obj);
        }
    }

        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u32>();
        size += _chain.calcPackedVarUint32Length(this.keys.length);
        for (let i=0; i<this.keys.length; i++) {
            size += this.keys[i].getSize();
        }

        size += _chain.calcPackedVarUint32Length(this.accounts.length);
        for (let i=0; i<this.accounts.length; i++) {
            size += this.accounts[i].getSize();
        }

        size += _chain.calcPackedVarUint32Length(this.waits.length);
        for (let i=0; i<this.waits.length; i++) {
            size += this.waits[i].getSize();
        }

        return size;
    }
}


@packer(nocodegen)
export class NewAccount implements _chain.Packer {
    
    constructor(
        public creator: Name = new Name(),
        public name: Name = new Name(),
        public owner: Authority = new Authority(),
        public active: Authority = new Authority(),
    ){}
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.creator);
        enc.pack(this.name);
        enc.pack(this.owner);
        enc.pack(this.active);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.creator = obj;
        }
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.name = obj;
        }
        
        {
            let obj = new Authority();
            dec.unpack(obj);
            this.owner = obj;
        }
        
        {
            let obj = new Authority();
            dec.unpack(obj);
            this.active = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.creator.getSize();
        size += this.name.getSize();
        size += this.owner.getSize();
        size += this.active.getSize();
        return size;
    }
}


@packer(nocodegen)
export class BuyRamBytes implements _chain.Packer {
    
    constructor(
        public creator: Name = new Name(),
        public newAccount: Name = new Name(),
        public ramBytes: u32 = 0,
    ){}
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.creator);
        enc.pack(this.newAccount);
        enc.packNumber<u32>(this.ramBytes);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.creator = obj;
        }
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.newAccount = obj;
        }
        this.ramBytes = dec.unpackNumber<u32>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.creator.getSize();
        size += this.newAccount.getSize();
        size += sizeof<u32>();
        return size;
    }
}

//packer
// type TxRequest struct {
// 	nonce     uint64 //primary : t.nonce
// 	contract  chain.Name
// 	process   chain.Uint128
// 	asset     chain.Uint128
// 	members   []chain.Uint128
// 	threshold int32
// 	amount    chain.Uint128
// 	extra     []byte
// 	timestamp uint64
// }


@packer(nocodegen)
export class TxRequest implements _chain.Packer {
    
    constructor(
        public nonce:     u64 = 0,
        public contract:  Name = new Name(),
        public process:   U128 = new U128(0),
        public asset:     U128 = new U128(0),
        public members:   U128[] = [],
        public threshold: i32 = 0,
        public amount:    U128 = new U128(0),
        public extra:     u8[] = [],
        public timestamp: u64 = 0
    ){}
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.nonce);
        enc.pack(this.contract);
        enc.pack(this.process);
        enc.pack(this.asset);
        enc.packObjectArray(this.members);
        enc.packNumber<i32>(this.threshold);
        enc.pack(this.amount);
        enc.packNumberArray<u8>(this.extra)
        enc.packNumber<u64>(this.timestamp);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.nonce = dec.unpackNumber<u64>();
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.contract = obj;
        }
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.process = obj;
        }
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.asset = obj;
        }
        
    {
        let length = <i32>dec.unpackLength();
        this.members = new Array<U128>(length)
        for (let i=0; i<length; i++) {
            let obj = new U128();
            this.members[i] = obj;
            dec.unpack(obj);
        }
    }

        this.threshold = dec.unpackNumber<i32>();
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.amount = obj;
        }
        this.extra = dec.unpackNumberArray<u8>();
        this.timestamp = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += this.contract.getSize();
        size += this.process.getSize();
        size += this.asset.getSize();
        size += _chain.calcPackedVarUint32Length(this.members.length);
        for (let i=0; i<this.members.length; i++) {
            size += this.members[i].getSize();
        }

        size += sizeof<i32>();
        size += this.amount.getSize();
        size += _chain.calcPackedVarUint32Length(this.extra.length);size += sizeof<u8>()*this.extra.length;
        size += sizeof<u64>();
        return size;
    }
}



@packer(nocodegen)
export class ErrorMessage implements _chain.Packer {
    
    constructor(
        public err: string = ""
    ){}
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packString(this.err);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.err = dec.unpackString();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += _chain.Utils.calcPackedStringLength(this.err);
        return size;
    }
}
