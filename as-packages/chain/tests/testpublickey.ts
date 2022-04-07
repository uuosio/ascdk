import { PublicKey, printString, printHex, check, Contract } from "as-chain";

@packer
class MyData {
    constructor(
        public name: string
    ){}
}

@contract
class MyContract extends Contract {
    hexToBytes(hex: string): u8[] {
        let bytes = new Array<u8>();
        for (let c = 0; c < hex.length; c += 2) {
            bytes.push(<u8>parseInt(hex.substr(c, 2), 16));
        }
        return bytes;
    }

    bytesEqual(a: u8[], b: u8[]): bool {
        if (a.length != b.length) {
            return false;
        }
        for (let i=0; i<a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    @action("testpub")
    testPublicKey(
        k1: PublicKey,
        r1: PublicKey,
        webAuthN: PublicKey
    ): void {
        let rawK1 = this.hexToBytes('00000080ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        let rawR1 = this.hexToBytes('0102b323ea27d191143eb9ad27c96db15d8b129d3096a0cb17ae11ae26abce803340');
        let rawWebauthn = this.hexToBytes('020378b76107e4503328bdd109934d63abc4457c7c8a0f59126d288fa51189752e0301096c6f63616c686f7374');
        let _k1 = new PublicKey();
        let _r1 = new PublicKey();
        let _webAuthN = new PublicKey();
        printString("\n");
        printHex(rawR1);
        //
        _k1.unpack(rawK1);
        _r1.unpack(rawR1);
        _webAuthN.unpack(rawWebauthn);
        check(k1 == _k1, "bad k1 key");
        check(r1 == _r1, "bad r1 key");
        check(webAuthN == _webAuthN, "bad webauthn key");

        check(!(k1 != _k1), "bad k1 key");
        check(!(r1 != _r1), "bad r1 key");
        check(!(webAuthN != _webAuthN), "bad webauthn key");

        check(this.bytesEqual(k1.pack(), _k1.pack()), "bad k1 key");
        check(this.bytesEqual(r1.pack(), _r1.pack()), "bad k1 key");
        check(this.bytesEqual(webAuthN.pack(), _webAuthN.pack()), "bad k1 key");

        check(k1 < r1, "bad value 1");
        check(k1 < webAuthN, "bad value 2");
        check(webAuthN > k1, "bad value 3");
        check(r1 > k1, "bad value 4");

        k1.k1!.data![0] = 1;
        _k1.k1!.data![0] = 2;
        check(k1 < _k1, "bad value 5");

        k1.k1!.data![0] = 2;
        _k1.k1!.data![0] = 1;
        check(k1 > _k1, "bad value 6");

        r1.r1!.data![0] = 1;
        _r1.r1!.data![0] = 2;
        check(r1 < _r1, "bad value 7");

        r1.r1!.data![0] = 2;
        _r1.r1!.data![0] = 1;
        check(r1 > _r1, "bad value 8");
    }
}
