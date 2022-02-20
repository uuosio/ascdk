import { Name, Asset, Symbol, check, isValid, printString, contract, action } from "as-chain"

@contract("hello")
class MyContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
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
            let sym = new Symbol("EOS", 4)
            let ret = sym.isValid();
            check(ret, "bad symbol");
            
            let value = this.stringToU64('EOS');
            ret = isValid(value);
            check(ret, "bad value");

            value = this.stringToU64('EOS ');
            check(!isValid(value), "bad value");

            value = this.stringToU64('EOS E');
            check(!isValid(value), "bad value");

            value = this.stringToU64('EEEEEE ');
            check(!isValid(value), "bad value");
        }

        {
            let a = new Asset(10, new Symbol("EOS", 4));
            let b = new Asset(5, new Symbol("EOS", 4));
            check( a > b, "a > b");
            check( b < a, "b > a");
            check( a != b, "a != b");
            check( a - b == new Asset(5, new Symbol("EOS", 4)), "bad value");
            check( a + b == new Asset(15, new Symbol("EOS", 4)), "bad value");
            check( a / b == new Asset(2, new Symbol("EOS", 4)), "bad value");
            check( a * b == new Asset(50, new Symbol("EOS", 4)), "bad value");
        }
        printString('done!\n')
    }
}
