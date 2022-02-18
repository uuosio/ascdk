import * as env from "./env"
import { Encoder, Decoder, Packer } from "./serializer"
import { Name } from "./name"
import { Utils } from "./utils"
import { printHex, printString } from "./debug"

export function actionDataSize(): u32 {
    return env.action_data_size();
}

export function readActionData(): u8[] {
    let size = env.action_data_size();
    var arr = new Array<u8>(size);
    
    let ptr = arr.dataStart;
    env.read_action_data(ptr, size);    
    return arr;
}

export class PermissionLevel implements Packer {
    constructor(
        public actor: Name,
        public permission: Name) {
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
        public authorization: PermissionLevel[],
        public account: Name,
        public name: Name,
        public data: u8[]) {
    }

    send(): void {
        let data = this.pack();
        env.send_inline(data.dataStart, data.length);
    }

    pack(): u8[] {
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

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.account = dec.unpackName();
        this.name = dec.unpackName();
        let length = dec.unpackLength();
        return 0;
    }

    getSize(): usize {
        return 0;
    }
}
