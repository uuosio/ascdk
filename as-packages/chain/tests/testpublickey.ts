import * as chain from "as-chain"

@packer
class MyData {
    constructor(
        public name: string
    ){}
}

@contract("hello")
class MyContract {
    constructor(
        public receiver: chain.Name,
        public firstReceiver: chain.Name,
        public action: chain.Name) {
    }
    
    hexToBytes(hex: string): u8[] {
        let bytes = new Array<u8>();
        for (let c = 0; c < hex.length; c += 2) {
            bytes.push(<u8>parseInt(hex.substr(c, 2), 16));
        }
        return bytes;
    }

    bytesEqual(a: u8[], b:u8[]): bool {
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
        k1: chain.PublicKey,
        r1: chain.PublicKey,
        webAuthN: chain.PublicKey
    ): void {
        let rawK1 = this.hexToBytes('00000080ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        let rawR1 = this.hexToBytes('0102b323ea27d191143eb9ad27c96db15d8b129d3096a0cb17ae11ae26abce803340');
        let rawWebauthn = this.hexToBytes('020378b76107e4503328bdd109934d63abc4457c7c8a0f59126d288fa51189752e0301096c6f63616c686f7374');
        let _k1 = new chain.PublicKey();
        let _r1 = new chain.PublicKey();
        let _webAuthN = new chain.PublicKey();
        chain.printString("\n");
        chain.printHex(rawR1);
        //
        _k1.unpack(rawK1);
        _r1.unpack(rawR1);
        _webAuthN.unpack(rawWebauthn);
        chain.assert(k1 == _k1, "bad k1 key");
        chain.assert(r1 == _r1, "bad r1 key");
        chain.assert(webAuthN == _webAuthN, "bad webauthn key");

        chain.assert(!(k1 != _k1), "bad k1 key");
        chain.assert(!(r1 != _r1), "bad r1 key");
        chain.assert(!(webAuthN != _webAuthN), "bad webauthn key");

        chain.assert(this.bytesEqual(k1.pack(), _k1.pack()), "bad k1 key");
        chain.assert(this.bytesEqual(r1.pack(), _r1.pack()), "bad k1 key");
        chain.assert(this.bytesEqual(webAuthN.pack(), _webAuthN.pack()), "bad k1 key");
    }
}
