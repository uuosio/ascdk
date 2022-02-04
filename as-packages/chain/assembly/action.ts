import * as env from "./env"
import { Encoder, Decoder, Serializer } from "./serializer"
import { Name } from "./name"
import { Utils } from "./utils"
import { printHex, printString } from "./debug"

export function actionDataSize(): u32 {
    return env.action_data_size();
}

export function readActionData(): u8[] {
    let size = env.action_data_size();
    var arr = new Array<u8>(size);
    
    let ptr = changetype<ArrayBufferView>(arr).dataStart;
    env.read_action_data(ptr, size);    
    return arr;
}

export class PermissionLevel implements Serializer {
    actor: Name;
    permission: Name;

    constructor(actor: Name, permission: Name) {
        this.actor = actor;
        this.permission = permission;
    }

    serialize(): u8[] {
        let enc = new Encoder(8*2);
        enc.packName(this.actor);
        enc.packName(this.permission);
        return enc.getBytes();
    }

    deserialize(data: u8[]): void {
        let dec = new Decoder(data);
        this.actor = dec.unpackName();
        this.permission = dec.unpackName();
    }
}

export class Action implements Serializer{
    account: Name
    name: Name
    authorization: PermissionLevel[]
    data: u8[]

    constructor(authorization: PermissionLevel[], account: Name, name: Name, data: u8[]) {
        this.account = account;
        this.name = name;
        this.authorization = authorization;
        this.data = data;
    }

    send(): void {
        let serializedAction = this.serialize();
        let ptr = Utils.getDataStart(serializedAction);
        env.send_inline(ptr, serializedAction.length)
    }

    serialize(): u8[] {
        let enc = new Encoder(8*2 + 1 + 1 + this.authorization.length * 16 + this.data.length);
        enc.packName(this.account);
        enc.packName(this.name);
        enc.packLength(this.authorization.length);
        for (let i = 0; i<this.authorization.length; i++) {
            enc.pack(this.authorization[i]);
        }
        enc.packArray<u8>(this.data);
        return enc.getBytes();
    }

    deserialize(data: u8[]): void {

    }
}
