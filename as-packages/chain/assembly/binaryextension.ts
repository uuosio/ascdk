import { Packer, Encoder, Decoder } from "./serializer"

export class BinaryExtension<T extends Packer> implements Packer {
    constructor(
        public value: T | null = null
    ) {

    }

    pack(): u8[] {
        if (this.value) {
            let enc = new Encoder(this.getSize());
            enc.pack(this.value!);
            return enc.getBytes();    
        } else {
            return [];
        }
    }

    unpack(data: u8[]): usize {
        if (data.length == 0) {
            this.value = null;
            return 0;
        }

        let dec = new Decoder(data);
        let obj = instantiate<T>();
        dec.unpack(obj);
        this.value = obj;
        return dec.getPos();
    }

    getSize(): usize {
        if (!this.value) {
            return 0;
        }
        return this.value!.getSize();
    }
}
