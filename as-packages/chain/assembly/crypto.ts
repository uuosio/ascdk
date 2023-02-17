import { check } from "./system";
import { Decoder, Encoder, Packer } from "./serializer";
import { Utils } from "./utils";

import * as env from "./env";
import { U256 } from "./bignum";

class Checksum implements Packer {
    data: u8[] = new Array<u8>(<i32>this.getSize());
    constructor(
        data: u8[] | null = null
    ){
        if (data) {
            check(this.data.length == <i32>this.getSize(), "bad checksum length");
            this.assign(data);
        }
    }

    static fromString(str: string): Checksum {
        return new Checksum(Utils.hexToBytes(str))
    }

    assign(value: u8[]): void {
        check(value.length == <i32>this.getSize(), "bad assign length");
        env.memcpy(this.data.dataStart, value.dataStart, this.getSize());
    }

    pack(): u8[] {
        return this.data.slice(0);
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(this.getSize());
        return dec.getPos();
    }

    getSize(): usize {
        return 0;
    }

    toString(): string {
        return Utils.bytesToHex(this.data);
    }

    @inline @operator('==')
    static eq(a: Checksum, b: Checksum): bool {
        return Utils.bytesCmp(a.data, b.data) == 0;
    }

    @inline @operator('!=')
    static neq(a: Checksum, b: Checksum): bool {
        return Utils.bytesCmp(a.data, b.data) != 0;
    }
}

export class Checksum160 extends Checksum {
    getSize(): usize {
        return 20;
    }
}

export class Checksum256 extends Checksum {
    getSize(): usize {
        return 32;
    }
}

export class Checksum512 extends Checksum {
    getSize(): usize {
        return 64;
    }
}

export class ECCPublicKey implements Packer {
    constructor(
        public data: u8[] | null = null
    ) {
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

export class ECCUncompressedPublicKey implements Packer {
    constructor(
        public data: u8[] | null = null
    ) {
        if (data) {
            check(data.length == 65, "bad data size");
        }
        this.data = data;
    }

    pack(): u8[] {
        return this.data!;
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.data = dec.unpackBytes(65);
        return 65;
    }

    getSize(): usize {
        return 65;
    }

    toString(): string {
        return Utils.bytesToHex(this.data!);
    }

    @inline @operator('==')
    static eq(a: ECCUncompressedPublicKey, b: ECCUncompressedPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) == 0;
    }

    @inline @operator('!=')
    static neq(a: ECCUncompressedPublicKey, b: ECCUncompressedPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) != 0;
    }

    @inline @operator('>')
    static gt(a: ECCUncompressedPublicKey, b: ECCUncompressedPublicKey): bool {
        return Utils.bytesCmp(a.data!, b.data!) > 0;
    }

    @inline @operator('<')
    static lt(a: ECCUncompressedPublicKey, b: ECCUncompressedPublicKey): bool {
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
        enc.pack(this.key!);
        enc.packNumber<u8>(<u8>this.userPresence);
        enc.packString(this.rpid);
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
        } else if (this.keyType == PublicKeyType.WebAuthN) {
            enc.pack(this.webAuthN!);
        } else {
            check(false, "invalid Public Key type");
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
        return this.data.slice(0);
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
        return Utils.bytesCmp(a.data, b.data) == 0;
    }

    @inline @operator('!=')
    static neq(a: Signature, b: Signature): bool {
        return Utils.bytesCmp(a.data, b.data) != 0;
    }
}

/**
 * Key Recovery
 */

export function recoverKey(digest: Checksum256, sig: Signature): PublicKey {
    let rawDigest = digest.pack();
    let rawSig = sig.pack();
    let rawPub = new Array<u8>(34);
    let ret = env.recover_key(rawDigest.dataStart, rawSig.dataStart, rawSig.length, rawPub.dataStart, rawPub.length);
    check(ret == 34, "bad recover_key return");
    let pub = new PublicKey();
    pub.unpack(rawPub);
    return pub;
}

export function assertRecoverKey(digest: Checksum256, sig: Signature, pub: PublicKey): void {
    let rawDigest = digest.pack();
    let rawSig = sig.pack();
    let rawPub = pub.pack();
    env.assert_recover_key(rawDigest.dataStart, rawSig.dataStart, rawSig.length, rawPub.dataStart, rawPub.length);
}

export function k1Recover(sig: Signature, digest: Checksum256): ECCUncompressedPublicKey | null {
    let rawSig = sig.pack();
    let rawDigest = digest.pack();
    let rawPub = new Array<u8>(65);
    let ret = env.k1_recover(rawSig.dataStart + 1, 65, rawDigest.dataStart, rawDigest.length, rawPub.dataStart, rawPub.length);
    if (ret == -1) {
        return null
    }
    let pub = new ECCUncompressedPublicKey();
    pub.unpack(rawPub);
    return pub;
}

/**
 * Hashing
 */
export function ripemd160(data: u8[]): Checksum160 {
    let hash = new Checksum160();
    let rawHash = new Array<u8>(20);
    env.ripemd160(data.dataStart, data.length, rawHash.dataStart);
    hash.data = rawHash;
    return hash;
}

export function sha256(data: u8[]): Checksum256 {
    let hash = new Checksum256();
    let rawHash = new Array<u8>(32);
    env.sha256(data.dataStart, data.length, rawHash.dataStart);
    hash.data = rawHash;
    return hash;
}

export function sha1(data: u8[]): Checksum160 {
    let hash = new Checksum160();
    let rawHash = new Array<u8>(20);
    env.sha1(data.dataStart, data.length, rawHash.dataStart);
    hash.data = rawHash;
    return hash;
}

export function sha512(data: u8[]): Checksum512 {
    let hash = new Checksum512();
    let rawHash = new Array<u8>(64);
    env.sha512(data.dataStart, data.length, rawHash.dataStart);
    hash.data = rawHash;
    return hash;
}

function sha3Helper(data: u8[], keccak: boolean): Checksum256 {
    let hash = new Checksum256();
    let rawHash = new Array<u8>(32);
    env.sha3(data.dataStart, data.length, rawHash.dataStart, rawHash.length, +keccak);
    hash.data = rawHash;
    return hash;
}

export function keccak(data: u8[]): Checksum256 {
    return sha3Helper(data, true);
}

export function sha3(data: u8[]): Checksum256 {
    return sha3Helper(data, false);
}

export function blake2(rounds: u32, state: u8[], msg: u8[], t0_offset: u8[], t1_offset: u8[], final: boolean): Checksum512 | null {
    // Validation
    check(state.length == 64, "Blake2 state must be 64 bytes");
    check(msg.length == 128, "Blake2 msg must be 128 bytes");
    check(t0_offset.length == 8, "Blake2 t0_offset must be 8 bytes");
    check(t1_offset.length == 8, "Blake2 t1_offset must be 8 bytes");

    // hash
    let hash = new Checksum512();
    let rawHash = new Array<u8>(64);
    const ret = env.blake2_f(rounds, state.dataStart, state.length, msg.dataStart, msg.length, t0_offset.dataStart, t0_offset.length, t1_offset.dataStart, t1_offset.length, +final, rawHash.dataStart, rawHash.length);
    if (ret == -1) {
        return null
    }
    hash.data = rawHash;
    return hash;
}

/**
 * Assert Hashing
 */
export function assertRipemd160(data: u8[], hash: Checksum160): void {
    env.assert_ripemd160(data.dataStart, data.length, hash.pack().dataStart);
}

export function assertSha256(data: u8[], hash: Checksum256): void {
    env.assert_sha256(data.dataStart, data.length, hash.pack().dataStart);
}

export function assertSha1(data: u8[], hash: Checksum160): void {
    env.assert_sha1(data.dataStart, data.length, hash.pack().dataStart);
}

export function assertSha512(data: u8[], hash: Checksum512): void {
    env.assert_sha512(data.dataStart, data.length, hash.pack().dataStart);
}

export function assertSha3(data: u8[], hash: Checksum256): void {
    const actualHash = sha3Helper(data, false);
    check(hash == actualHash, "SHA3 hash of `data` does not match given `hash`");
}

export function assertKeccak(data: u8[], hash: Checksum256): void {
    const actualHash = sha3Helper(data, true);
    check(hash == actualHash, "Keccak hash of `data` does not match given `hash`");
}

/**
 * BN Curve
 */
export class AltBn128G1 implements Packer {
    constructor(
        public x: U256 = new U256(),
        public y: U256 = new U256()
    ) {}

    pack(): u8[] {
        const rawX = this.x.toBytes(true);
        const rawY = this.y.toBytes(true)
        return rawX.concat(rawY);
    }

    packLE(): u8[] {
        const rawX = this.x.toBytes();
        const rawY = this.y.toBytes()
        return rawX.concat(rawY);
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.x = U256.fromBytesBE(dec.unpackBytes(32))
        this.y = U256.fromBytesBE(dec.unpackBytes(32))
        return dec.getPos();
    }

    unpackLE(data: u8[]): usize {
        let dec = new Decoder(data);
        this.x = U256.fromBytesLE(dec.unpackBytes(32))
        this.y = U256.fromBytesLE(dec.unpackBytes(32))
        return dec.getPos();
    }

    getSize(): usize {
        return 64;
    }

    toString(): string {
        return Utils.bytesToHex(this.pack())
    }

    @inline @operator('==')
    static eq(a: AltBn128G1, b: AltBn128G1): bool {
        return a.x == b.x && a.y == b.y;
    }

    @inline @operator('!=')
    static neq(a: AltBn128G1, b: AltBn128G1): bool {
        return a.x != b.x || a.y != b.y;
    }
}

export class AltBn128G2 implements Packer {
    constructor(
        public x1: U256 = new U256(),
        public x2: U256 = new U256(),
        public y1: U256 = new U256(),
        public y2: U256 = new U256()
    ) {}

    pack(): u8[] {
        const rawX1 = this.x1.toBytes(true);
        const rawX2 = this.x2.toBytes(true);
        const rawY1 = this.y1.toBytes(true);
        const rawY2 = this.y2.toBytes(true);
        return rawX1.concat(rawX2).concat(rawY1).concat(rawY2);
    }

    packLE(): u8[] {
        const rawX1 = this.x1.toBytes();
        const rawX2 = this.x2.toBytes();
        const rawY1 = this.y1.toBytes();
        const rawY2 = this.y2.toBytes();
        return rawX1.concat(rawX2).concat(rawY1).concat(rawY2);
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.x1 = U256.fromBytesBE(dec.unpackBytes(32))
        this.x2 = U256.fromBytesBE(dec.unpackBytes(32))
        this.y1 = U256.fromBytesBE(dec.unpackBytes(32))
        this.y2 = U256.fromBytesBE(dec.unpackBytes(32))
        return dec.getPos();
    }

    unpackLE(data: u8[]): usize {
        let dec = new Decoder(data);
        this.x1 = U256.fromBytesLE(dec.unpackBytes(32))
        this.x2 = U256.fromBytesLE(dec.unpackBytes(32))
        this.y1 = U256.fromBytesLE(dec.unpackBytes(32))
        this.y2 = U256.fromBytesLE(dec.unpackBytes(32))
        return dec.getPos();
    }

    getSize(): usize {
        return 128;
    }

    toString(): string {
        return Utils.bytesToHex(this.pack())
    }

    @inline @operator('==')
    static eq(a: AltBn128G2, b: AltBn128G2): bool {
        return a.x1 == b.x1 && a.x2 == b.x2 &&
               a.y1 == b.y1 && a.y2 == b.y2;
    }

    @inline @operator('!=')
    static neq(a: AltBn128G2, b: AltBn128G2): bool {
        return a.x1 != b.x1 || a.x2 != b.x2 ||
               a.y1 != b.y1 || a.y2 != b.y2;
    }
}

export class AltBn128Pair implements Packer {
    constructor(
        public g1: AltBn128G1 = new AltBn128G1(),
        public g2: AltBn128G2 = new AltBn128G2(),
    ) {}

    pack(): u8[] {
        const rawG1 = this.g1.pack();
        const rawG2 = this.g2.pack();
        return rawG1.concat(rawG2);
    }

    packLE(): u8[] {
        const rawG1 = this.g1.packLE();
        const rawG2 = this.g2.packLE();
        return rawG1.concat(rawG2);
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.g1.unpack(dec.unpackBytes(64))
        this.g2.unpack(dec.unpackBytes(128))
        return dec.getPos();
    }

    unpackLE(data: u8[]): usize {
        let dec = new Decoder(data);
        this.g1.unpackLE(dec.unpackBytes(64))
        this.g2.unpackLE(dec.unpackBytes(128))
        return dec.getPos();
    }

    getSize(): usize {
        return 192;
    }
}

export function bn128Add(op1: AltBn128G1, op2: AltBn128G1): AltBn128G1 {
    const rawOp1 = op1.pack();
    const rawOp2 = op2.pack();
    const rawResult = new Array<u8>(64);
    const ret = env.alt_bn128_add(rawOp1.dataStart, rawOp1.length, rawOp2.dataStart, rawOp2.length, rawResult.dataStart, rawResult.length)
    check(ret == 0, "bn128Add error");
    const result = new AltBn128G1();
    result.unpack(rawResult);
    return result;
}

export function bn128Mul(g1: AltBn128G1, scalar: U256): AltBn128G1 {
    const rawG1 = g1.pack();
    const rawScalar = scalar.toBytes(true);
    const rawResult = new Array<u8>(64);
    const ret = env.alt_bn128_mul(rawG1.dataStart, rawG1.length, rawScalar.dataStart, rawScalar.length, rawResult.dataStart, rawResult.length)
    check(ret == 0, "bn128Mul error");
    const result = new AltBn128G1();
    result.unpack(rawResult);
    return result;
}

export function bn128Pair(pairs: AltBn128Pair[]): boolean {
    let input: u8[] = []
    for (let i=0; i<pairs.length; i++) {
        input = input.concat(pairs[i].pack())
    }
    const ret = env.alt_bn128_pair(input.dataStart, input.length)
    check(ret != -1, "bn128Pair error");
    return ret == 0;
}

export function modExp(base: U256, exp: U256, mod: U256): U256 {
    const rawBase = Utils.hexToBytes(base.toString(16).padStart(64, '0'));
    const rawExp = Utils.hexToBytes(exp.toString(16).padStart(64, '0'));
    const rawMod = Utils.hexToBytes(mod.toString(16).padStart(64, '0'));
    const rawResult = new Array<u8>(32);
    const ret = env.mod_exp(rawBase.dataStart, rawBase.length, rawExp.dataStart, rawExp.length, rawMod.dataStart, rawMod.length, rawResult.dataStart, rawResult.length)
    check(ret == 0, "modExp error");
    return U256.fromBytesBE(rawResult)
}