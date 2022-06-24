import { printString } from "./debug";
import { Packer, Encoder, Decoder } from "./serializer"
import { Utils } from "./utils"

export class Optional<T extends Packer> implements Packer {
    value: T | null;
    constructor(
        value: T | null = null
    ) {
        this.value = value;
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize())
        if (this.value) {
            enc.packNumber<u8>(1);
            enc.pack(this.value!);
            return enc.getBytes();
        } else {
            enc.packNumber<u8>(0);
            return enc.getBytes();
        }
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data)
        let hasValue = dec.unpackNumber<u8>();
        if (!hasValue) {
            this.value = null;
            return 1;
        }
        let obj = instantiate<T>();
        dec.unpack(obj);
        this.value = obj;
        return dec.getPos();
    }

    getSize(): usize {
        if (!this.value) {
            return 1;
        }
        return 1 + this.value!.getSize();
    }
}

export class OptionalNumber<T> implements Packer {
    value: T;
    hasValue: bool;
    constructor(
        value: T = 0, hasValue: bool = true
    ) {
        if (hasValue) {
            this.value = value;
        }
        this.hasValue = hasValue;
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize())
        if (this.value) {
            enc.packNumber<u8>(1);
            enc.packNumber<T>(this.value);
            return enc.getBytes();
        } else {
            enc.packNumber<u8>(0);
            return enc.getBytes();
        }
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        let hasValue = dec.unpackNumber<u8>();
        if (!hasValue) {
            this.hasValue = false;
            this.value = 0;
            return 1;
        }
        this.hasValue = true;
        this.value = dec.unpackNumber<T>();
        return dec.getPos();
    }

    getSize(): usize {
        if (!this.value) {
            return 1;
        }
        return 1 + sizeof<T>();
    }
}

export class OptionalString implements Packer {
    value: string = "";
    hasValue: bool;
    constructor(
        value: string="", hasValue: bool=true
    ) {
        this.value = value;
        this.hasValue = hasValue;
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize())
        if (this.hasValue) {
            enc.packNumber<u8>(1);
            enc.packString(this.value);
            return enc.getBytes();
        } else {
            enc.packNumber<u8>(0);
            return enc.getBytes();
        }
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data)
        let hasValue = dec.unpackNumber<u8>();
        if (!hasValue) {
            this.hasValue = false;
            this.value = "";
            return 1;
        }
        this.hasValue = true;
        this.value = dec.unpackString();
        return dec.getPos();
    }

    getSize(): usize {
        if (!this.hasValue) {
            return 1;
        }
        return 1 + Utils.calcPackedStringLength(this.value);
    }
}