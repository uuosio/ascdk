import { Name, Asset, Symbol, check, isValid, printString, contract, action } from "as-chain";

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
            let sym = new Symbol("EOS", 4);
            let ret = sym.isValid();
            check(ret, "bad symbol");
            check(sym.precision() == 4, "bad precision");
            check(sym.toString() == '4,EOS', "bad symbol")

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

            // Operators
            check( a + b == new Asset(15, new Symbol("EOS", 4)), "bad value");
            check( a - b == new Asset(5, new Symbol("EOS", 4)), "bad value");
            check( a * b == new Asset(50, new Symbol("EOS", 4)), "bad value");
            check( a / b == new Asset(2, new Symbol("EOS", 4)), "bad value");
            check( a == new Asset(10, new Symbol("EOS", 4)), "bad value");
            check( !(a == b), "bad value");
            check( a != b, "bad value");
            check( !(a != new Asset(10, new Symbol("EOS", 4))), "bad value");
            check( b < a, "b < a");
            check( !(a < b), "b < a");
            check( a > b, "a > b");
            check( !(b > a), "a > b");
            check( b <= a, "b <= a");
            check( !(a <= b), "b <= a");
            check( b <= new Asset(5, new Symbol("EOS", 4)), "bad value");
            check( a >= b, "a >= b");
            check( !(b >= a), "a >= b");
            check( a >= new Asset(5, new Symbol("EOS", 4)), "bad value");

            // Direct
            check( Asset.add(a, b) == new Asset(15, new Symbol("EOS", 4)), "bad value");
            check( Asset.sub(a, b) == new Asset(5, new Symbol("EOS", 4)), "bad value");
            check( Asset.mul(a, b) == new Asset(50, new Symbol("EOS", 4)), "bad value");
            check( Asset.div(a, b) == new Asset(2, new Symbol("EOS", 4)), "bad value");
            check( Asset.eq(a, new Asset(10, new Symbol("EOS", 4))), "bad value");
            check( !Asset.eq(a, b), "bad value");
            check( Asset.ne(a, b), "bad value");
            check( !Asset.ne(a, new Asset(10, new Symbol("EOS", 4))), "bad value");
            check( Asset.lt(b, a), "b < a");
            check( !Asset.lt(a, b), "b < a");
            check( Asset.gt(a, b), "a > b");
            check( !Asset.gt(b, a), "a > b");
            check( Asset.lte(b, a), "b <= a");
            check( !Asset.lte(a, b), "b <= a");
            check( Asset.lte(b, new Asset(5, new Symbol("EOS", 4))), "bad value");
            check( Asset.gte(a, b), "a >= b");
            check( !Asset.gte(b, a), "a >= b");
            check( Asset.gte(a, new Asset(5, new Symbol("EOS", 4))), "bad value");
        }

        printString('done!\n');
    }
}
