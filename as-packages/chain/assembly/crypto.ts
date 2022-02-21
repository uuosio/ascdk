import { check } from "./system";
import { Decoder, Encoder, Packer } from "./serializer";
import { Utils } from "./utils";
import { print } from "./debug"

import { recover_key, assert_recover_key } from "./env";

export class Checksum160 implements Packer {
    data!: u8[];

    pack(): u8[] {
        return this.data;
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(20);
        return dec.getPos();
    }

    getSize(): usize {
        return 20;
    }

    toString(): string {
        return Utils.bytesToHex(this.data);
    }

    @inline @operator('==')
    static eq(a: Checksum160, b: Checksum160): bool {
        return Utils.bytesCmp(a.data, b.data) == 0;
    }

    @inline @operator('!=')
    static neq(a: Checksum160, b: Checksum160): bool {
        return Utils.bytesCmp(a.data, b.data) != 0;
    }
}

export class Checksum256 implements Packer {
    data!: u8[];

    pack(): u8[] {
        return this.data;
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(32);
        return dec.getPos();
    }

    getSize(): usize {
        return 32;
    }

    toString(): string {
        return Utils.bytesToHex(this.data);
    }

    @inline @operator('==')
    static eq(a: Checksum256, b: Checksum256): bool {
        return Utils.bytesCmp(a.data, b.data) == 0;
    }

    @inline @operator('!=')
    static neq(a: Checksum256, b: Checksum256): bool {
        return Utils.bytesCmp(a.data, b.data) != 0;
    }
}

export class Checksum512 implements Packer {
    data!: u8[];

    pack(): u8[] {
        return this.data;
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(64);
        return dec.getPos();
    }

    getSize(): usize {
        return 64;
    }

    toString(): string {
        return Utils.bytesToHex(this.data);
    }

    @inline @operator('==')
    static eq(a: Checksum512, b: Checksum512): bool {
        return Utils.bytesCmp(a.data, b.data) == 0;
    }

    @inline @operator('!=')
    static neq(a: Checksum512, b: Checksum512): bool {
        return Utils.bytesCmp(a.data, b.data) != 0;
    }
}

export class ECCPublicKey implements Packer {
    data: Array<u8> | null;

    constructor(data: u8[] | null = null) {
        if (data) {
            check(data.length == 33, "bad data size");
        }
        this.data = data;
    }

    pack(): u8[] {
        return this.data!;
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(33);
        return 33;
    }

    getSize(): usize {
        return 33;
    }

    toString(): string {
        return Utils.bytesToHex(this.data!);
    }

    @inline @operator('==')
    static eq(a: ECCPublicKey, b: ECCPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) == 0;
    }

    @inline @operator('!=')
    static neq(a: ECCPublicKey, b: ECCPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) != 0;
    }

    @inline @operator('>')
    static gt(a: ECCPublicKey, b: ECCPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) > 0;
    }

    @inline @operator('<')
    static lt(a: ECCPublicKey, b: ECCPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) < 0;
    }
}

export enum UserPresence {
    USER_PRESENCE_NONE = 0,
    USER_PRESENCE_PRESENT = 1,
    USER_PRESENCE_VERIFIED = 2,
}

export class WebAuthNPublicKey implements Packer {
    public key: ECCPublicKey | null = null;
    public userPresence: UserPresence;
    public rpid: string = "";

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.key = new ECCPublicKey();
        dec.unpack(this.key!);
        this.userPresence = <UserPresence>dec.unpackNumber<u8>();
        this.rpid = dec.unpackString();
        return 0;
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.key!.getSize();
        size += 1;
        size += Utils.calcPackedStringLength(this.rpid);
        return size;
    }

    @inline @operator('==')
    static eq(a: WebAuthNPublicKey, b: WebAuthNPublicKey): bool {
        if (a.key! != b.key!) {
            return false;
        }
        if (a.userPresence != b.userPresence) {
            return false;
        }
        if (a.rpid != b.rpid) {
            return false;
        }
        return true;
    }

    @inline @operator('!=')
    static neq(a: WebAuthNPublicKey, b: WebAuthNPublicKey): bool {
        return !(a == b);
    }

    @inline @operator('>')
    static gt(a: WebAuthNPublicKey, b: WebAuthNPublicKey): bool {
        let rawA = a.pack();
        let rawB = b.pack();
        return Utils.bytesCmp(rawA, rawB) > 0;
    }

    @inline @operator('<')
    static lt(a: WebAuthNPublicKey, b: WebAuthNPublicKey): bool {
        let rawA = a.pack();
        let rawB = b.pack();
        return Utils.bytesCmp(rawA, rawB) < 0;
    }
}

export enum PublicKeyType {
    K1 = 0,
    R1 = 1,
    WebAuthN = 2
}

export class PublicKey implements Packer {
    keyType: PublicKeyType;
    k1: ECCPublicKey | null;
    r1: ECCPublicKey | null;
    webAuthN: WebAuthNPublicKey | null;

    constructor(keyType: PublicKeyType = PublicKeyType.K1, data: u8[] | null = null) {
        this.keyType = keyType;
        if (data != null) {
            this.k1 = new ECCPublicKey();
            this.k1!.unpack(data);
        }
    }

    toString(): string {
        let raw = this.pack();
        return Utils.bytesToHex(raw);
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packNumber<u8>(<u8>this.keyType);
        if (this.keyType == PublicKeyType.K1) {
            enc.pack(this.k1!);
        } else if (this.keyType == PublicKeyType.R1) {
            enc.pack(this.r1!);
        } else {// WebAuthN
            enc.pack(this.webAuthN!);
        }
        return enc.getBytes();
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        let keyType = dec.unpackNumber<u8>();
        check(keyType >= 0 && keyType <= 2, "invalid public key type");
        this.keyType = <PublicKeyType>keyType;
        if (this.keyType == PublicKeyType.K1) {
            this.k1 = new ECCPublicKey();
            dec.unpack(this.k1!);
        } else if (this.keyType == PublicKeyType.R1) {
            this.r1 = new ECCPublicKey();
            dec.unpack(this.r1!);
        } else {
            this.webAuthN = new WebAuthNPublicKey();
            dec.unpack(this.webAuthN!);
        }
        return dec.getPos();
    }

    getSize(): usize {
        if (this.keyType == PublicKeyType.K1 || this.keyType == PublicKeyType.R1) {
            return 33 + 1;
        }
        return 1 + this.webAuthN!.getSize();
    }

    @inline @operator('==')
    static eq(a: PublicKey, b: PublicKey): bool {
        if (a.keyType != b.keyType) {
            return false;
        }
        let keyType = a.keyType;
        if (keyType == PublicKeyType.K1) {
            return a.k1! == b.k1!;
        } else if (keyType == PublicKeyType.R1) {
            return a.r1! == b.r1!;
        } else {
            return a.webAuthN! == b.webAuthN!;
        }
    }

    @inline @operator('!=')
    static neq(a: PublicKey, b: PublicKey): bool {
        return !(a == b);
    }

    @inline @operator('>')
    static gt(a: PublicKey, b: PublicKey): bool {
        if (a.keyType > b.keyType) {
            return true;
        }

        if (a.keyType < b.keyType) {
            return false;
        }

        if (a.keyType == PublicKeyType.K1) {
            return a.k1! > b.k1!;
        } else if (a.keyType == PublicKeyType.R1) {
            return a.r1! > b.r1!;
        } else {
            return a.webAuthN! > b.webAuthN!;
        }
    }

    @inline @operator('<')
    static lt(a: PublicKey, b: PublicKey): bool {
        if (a.keyType < b.keyType) {
            return true;
        }

        if (a.keyType > b.keyType) {
            return false;
        }

        if (a.keyType == PublicKeyType.K1) {
            return a.k1! < b.k1!;
        } else if (a.keyType == PublicKeyType.R1) {
            return a.r1! < b.r1!;
        } else {
            return a.webAuthN! < b.webAuthN!;
        }
    }
}

export class Signature implements Packer {
    data!: u8[];

    pack(): u8[] {
        return this.data;
    }

    unpack(data: u8[]): usize {
        check(data.length >= 66, "bad signature");
        check(data[0] == 0, "bad signature");
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(66);
        return dec.getPos();
    }

    getSize(): usize {
        return 66;
    }

    toString(): string {
        return Utils.bytesToHex(this.data);
    }

    @inline @operator('==')
    static eq(a: Signature, b: Signature): bool {
        print(`++++++++:${a}, ${b}`)
        return Utils.bytesCmp(a.data, b.data) == 0;
    }

    @inline @operator('!=')
    static neq(a: Signature, b: Signature): bool {
        return Utils.bytesCmp(a.data, b.data) != 0;
    }
}
// export function RecoverKey(digest_ptr: usize, sig_ptr: usize, siglen: u32, pub_ptr: usize, publen: u32): i32
// export function AssertRecoverKey(digest_ptr: usize, sig_ptr: usize, siglen: u32, pub_ptr: usize, publen: u32): void

export function RecoverKey(digest: Checksum256, sig: Signature): PublicKey {
    let rawDigest = digest.pack();
    let rawSig = sig.pack();
    let rawPub = new Array<u8>(34);
    let ret = recover_key(rawDigest.dataStart, rawSig.dataStart, rawSig.length, rawPub.dataStart, rawPub.length);
    check(ret == 34, "bad recover_key return");
    let pub = new PublicKey();
    pub.unpack(rawPub);
    return pub;
}

export function AssertRecoverKey(digest: Checksum256, sig: Signature, pub: PublicKey): void {
    let rawDigest = digest.pack();
    let rawSig = sig.pack();
    let rawPub = pub.pack();
    assert_recover_key(rawDigest.dataStart, rawSig.dataStart, rawSig.length, rawPub.dataStart, rawPub.length);
}
