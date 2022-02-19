import * as chain from "as-chain"

@contract("hello")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    stringToU64(s: string): u64 {
        let value: u64 = 0;
        for (let i=0; i<s.length; i++) {
            let c = <u64>s.charCodeAt(i);
            value <<= 8;
            value |= c;
        }
        return value;
    }

    @action("test1")
    testAsset(): void {
        {
            let sym = new chain.Symbol("EOS", 4)
            let ret = sym.isValid();
            chain.assert(ret, "bad symbol");
            
            let value = this.stringToU64('EOS');
            ret = chain.isValid(value);
            chain.check(ret, "bad value");

            value = this.stringToU64('EOS ');
            chain.check(!chain.isValid(value), "bad value");

            value = this.stringToU64('EOS E');
            chain.check(!chain.isValid(value), "bad value");

            value = this.stringToU64('EEEEEE ');
            chain.check(!chain.isValid(value), "bad value");
        }

        {
            let a = new chain.Asset(10, new chain.Symbol("EOS", 4));
            let b = new chain.Asset(5, new chain.Symbol("EOS", 4));
            chain.assert( a > b, "a > b");
            chain.assert( b < a, "b > a");
            chain.assert( a != b, "a != b");
            chain.assert( a - b == new chain.Asset(5, new chain.Symbol("EOS", 4)), "bad value");
            chain.assert( a + b == new chain.Asset(15, new chain.Symbol("EOS", 4)), "bad value");
            chain.assert( a / b == new chain.Asset(2, new chain.Symbol("EOS", 4)), "bad value");
            chain.assert( a * b == new chain.Asset(50, new chain.Symbol("EOS", 4)), "bad value");
        }
        chain.printString('done!\n')
    }
}
