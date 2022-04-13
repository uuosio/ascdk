import { Packer, Encoder, Decoder } from "./serializer"

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