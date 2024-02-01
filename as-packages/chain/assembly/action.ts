import * as env from "./env";
import { Encoder, Decoder, Packer } from "./serializer";
import { Name } from "./name";
import { calcPackedVarUint32Length, VarUint32 } from "./varint";
import { Checksum256 } from "./crypto";

export function getSender(): Name {
    return new Name(env.get_sender());
}

export function readActionData(): u8[] {
    let size = env.action_data_size();
    var arr = new Array<u8>(size);
    
    let ptr = arr.dataStart;
    env.read_action_data(ptr, size);    
    return arr;
}

export function unpackActionData<T extends Packer>(): T {
    let data = readActionData()
    let ret = instantiate<T>()
    ret.unpack(data)
    return ret
}

export function actionDataSize(): u32 {
    return env.action_data_size();
}

export function requireRecipient(name: Name): void {
    env.require_recipient(name.N);
}

export function requireAuth(name: Name): void {
    env.require_auth(name.N);
}

export function hasAuth(name: Name): bool {
    return env.has_auth(name.N);
}

export function requireAuth2(permissionLevel: PermissionLevel): void {
    env.require_auth2(permissionLevel.actor.N, permissionLevel.permission.N);
}

export function isAccount(name: Name): bool {
    return env.is_account(name.N);
}

export function publicationTime(): u64 {
    return env.publication_time();
}

export function currentReceiver(): Name {
    return new Name(env.current_receiver());
}

export function setActionReturnValue(returnValue: u8[]): void {
    env.set_action_return_value(returnValue.dataStart, returnValue.length);
}

export class PermissionLevel implements Packer {
    constructor(
        public actor: Name = new Name(),
        public permission: Name = Name.fromString("active")) {
    }

    pack(): u8[] {
        let enc = new Encoder(8*2);
        enc.packName(this.actor);
        enc.packName(this.permission);
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.actor = dec.unpackName();
        this.permission = dec.unpackName();
        return dec.getPos();
    }

    getSize(): usize {
        return 8*2;
    }
}

export class Action implements Packer{
    constructor(
        public account: Name = new Name(),
        public name: Name = new Name(),
        public authorization: PermissionLevel[] = [],
        public data: u8[] = [],
    ) {}

    static new(
        account: Name,
        name: Name,
        authorization: PermissionLevel[],
        packer: Packer): Action {
        return new Action(account, name, authorization, packer.pack());
    }

    send(): void {
        let data = this.pack();
        env.send_inline(data.dataStart, data.length);
    }

    send_context_free(): void {
        let data = this.pack();
        env.send_context_free_inline(data.dataStart, data.length);
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packName(this.account);
        enc.packName(this.name);
        enc.packLength(this.authorization.length);
        for (let i = 0; i<this.authorization.length; i++) {
            enc.pack(this.authorization[i]);
        }
        enc.packNumberArray<u8>(this.data);
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.account = dec.unpackName();
        this.name = dec.unpackName();
        let length = <i32>dec.unpackLength();
        this.authorization = new Array<PermissionLevel>(length);
        for (let i=0; i<length; i++) {
            let actor = dec.unpackName();
            let permission = dec.unpackName();
            let obj = new PermissionLevel(actor, permission);
            this.authorization[i] = obj;
        }
        this.data = dec.unpackNumberArray<u8>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += calcPackedVarUint32Length(this.authorization.length);
        size += this.authorization.length * 16;
        size += 16;
        size += calcPackedVarUint32Length(this.data.length);
        size += this.data.length;        
        return size;
    }
}

export class GetCodeHashResult implements Packer {
    constructor(
        public structVersion: VarUint32 = new VarUint32(0),
        public codeSequence: u64 = 0,
        public codeHash: Checksum256 = new Checksum256(),
        public vmType: u8 = 0,
        public vmVersion: u8 = 0
    ) {}

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.pack(this.structVersion);
        enc.packNumber<u64>(this.codeSequence);
        enc.pack(this.codeHash);
        enc.packNumber<u8>(this.vmType);
        enc.packNumber<u8>(this.vmVersion);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.structVersion = new VarUint32();
        dec.unpack(this.structVersion);
        this.codeSequence = dec.unpackNumber<u64>();
        this.codeHash = new Checksum256();
        dec.unpack(this.codeHash);
        this.vmType = dec.unpackNumber<u8>();
        this.vmVersion = dec.unpackNumber<u8>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.structVersion.getSize();
        size += sizeof<u64>();
        size += this.codeHash.getSize();
        size += sizeof<u8>();
        size += sizeof<u8>();   
        return size;
    }
}

export function getCodeHash(account: Name): GetCodeHashResult {
    const result = new GetCodeHashResult();
    const rawResult = new Array<u8>(<i32>(result.getSize()));
    env.get_code_hash(account.N, 0, rawResult.dataStart);
    result.unpack(rawResult);
    return result;
}