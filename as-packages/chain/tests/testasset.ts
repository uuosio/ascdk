import { ExtendedAsset, Asset, Symbol, check, isValid, printString, Contract, Name } from "as-chain";

@contract
class MyContract extends Contract{
    stringToU64(s: string): u64 {
        let value: u64 = 0;
        for (let i=0; i<s.length; i++) {
            let c = <u64>s.charCodeAt(s.length - i -1);
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
            check(ret, "bad value 1");

            value = this.stringToU64('EOSEOSE');
            check(isValid(value), "bad value 2");

            value = this.stringToU64('EOSEOS\x00');
            check(isValid(value), "bad value 3");

            value = this.stringToU64('EOS ');
            check(!isValid(value), "bad value 4");

            value = this.stringToU64('EOS E');
            check(!isValid(value), "bad value 5");

            value = this.stringToU64('EEEEEE ');
            check(!isValid(value), "bad value 6");

            value = this.stringToU64('EEEEEE9');
            check(!isValid(value), "bad value 7");

            value = this.stringToU64('EOSEOSEO');
            check(!isValid(value), "bad value 8");

            value = this.stringToU64('');
            check(!isValid(value), "bad value 9");

            value = this.stringToU64('EOSEO\x00EO');
            check(!isValid(value), "bad value 10");
        }

        {
            let a = new Asset(10, new Symbol("EOS", 4));
            let b = new Asset(5, new Symbol("EOS", 4));

            // From string
            check( Asset.eq(a, Asset.fromString("0.0010 EOS")), `${a} does not match ${Asset.fromString("0.0010 EOS")}`);
            check( Asset.neq(a, Asset.fromString("0.0005 EOS")), `${a} matches ${Asset.fromString("0.0005 EOS")}`);
            check( Asset.eq(b, Asset.fromString("0.0005 EOS")), `${b} does not match ${Asset.fromString("0.0005 EOS")}`);
            check( Asset.neq(b, Asset.fromString("0.0010 EOS")), `${b} matches ${Asset.fromString("0.0010 EOS")}`);

            // Operators
            check( a + b == new Asset(15, new Symbol("EOS", 4)), "bad value 5");
            check( a - b == new Asset(5, new Symbol("EOS", 4)), "bad value 6");
            check( a * b == new Asset(50, new Symbol("EOS", 4)), "bad value 7");
            check( a / b == new Asset(2, new Symbol("EOS", 4)), "bad value 8");
            check( a == new Asset(10, new Symbol("EOS", 4)), "bad value 9");
            check( !(a == b), "bad value 10");
            check( a != b, "bad value 11");
            check( !(a != new Asset(10, new Symbol("EOS", 4))), "bad value 12");
            check( b < a, "b < a");
            check( !(a < b), "b < a");
            check( a > b, "a > b");
            check( !(b > a), "a > b");
            check( b <= a, "b <= a");
            check( !(a <= b), "b <= a");
            check( b <= new Asset(5, new Symbol("EOS", 4)), "bad value 13");
            check( a >= b, "a >= b");
            check( !(b >= a), "a >= b");
            check( a >= new Asset(5, new Symbol("EOS", 4)), "bad value 14");

            // Direct
            check( Asset.add(a, b) == new Asset(15, new Symbol("EOS", 4)), "bad value 15");
            check( Asset.sub(a, b) == new Asset(5, new Symbol("EOS", 4)), "bad value 16");
            check( Asset.mul(a, b) == new Asset(50, new Symbol("EOS", 4)), "bad value 17");
            check( Asset.div(a, b) == new Asset(2, new Symbol("EOS", 4)), "bad value 18");
            check( Asset.eq(a, new Asset(10, new Symbol("EOS", 4))), "bad value 19");
            check( !Asset.eq(a, b), "bad value 20");
            check( Asset.neq(a, b), "bad value 21");
            check( !Asset.neq(a, new Asset(10, new Symbol("EOS", 4))), "bad value 22");
            check( Asset.lt(b, a), "b < a");
            check( !Asset.lt(a, b), "b < a");
            check( Asset.gt(a, b), "a > b");
            check( !Asset.gt(b, a), "a > b");
            check( Asset.lte(b, a), "b <= a");
            check( !Asset.lte(a, b), "b <= a");
            check( Asset.lte(b, new Asset(5, new Symbol("EOS", 4))), "bad value 23");
            check( Asset.gte(a, b), "a >= b");
            check( !Asset.gte(b, a), "a >= b");
            check( Asset.gte(a, new Asset(5, new Symbol("EOS", 4))), "bad value 24");
        }

        // Extended Asset
        {
            let a = new ExtendedAsset(new Asset(10, new Symbol("EOS", 4)), Name.fromString('eosio.token'));
            let b = new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token'));
            let c = new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('rock.token'));

            // Operators
            check( a + b == new ExtendedAsset(new Asset(15, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 25");
            check( a - b == new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 26");
            check( a == new ExtendedAsset(new Asset(10, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 27");
            check( b.quantity == c.quantity, "bad value 28");
            check( b.contract != c.contract, "bad value 29");
            check( b != c, "bad value 30");
            check( !(a == b), "bad value 31");
            check( a != b, "bad value 32");
            check( !(a != new ExtendedAsset(new Asset(10, new Symbol("EOS", 4)), Name.fromString('eosio.token'))), "bad value 33");
            check( b < a, "b < a");
            check( !(a < b), "b < a");
            check( a > b, "a > b");
            check( !(b > a), "a > b");
            check( b <= a, "b <= a");
            check( !(a <= b), "b <= a");
            check( b <= new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 34");
            check( a >= b, "a >= b");
            check( !(b >= a), "a >= b");
            check( a >= new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 35");

            // Direct
            check( ExtendedAsset.add(a, b) == new ExtendedAsset(new Asset(15, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 36");
            check( ExtendedAsset.sub(a, b) == new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token')), "bad value 37");
            check( ExtendedAsset.eq(a, new ExtendedAsset(new Asset(10, new Symbol("EOS", 4)), Name.fromString('eosio.token'))), "bad value 38");
            check( !ExtendedAsset.eq(a, b), "bad value 39");
            check( ExtendedAsset.neq(a, b), "bad value 40");
            check( !ExtendedAsset.neq(a, new ExtendedAsset(new Asset(10, new Symbol("EOS", 4)), Name.fromString('eosio.token'))), "bad value 41");
            check( ExtendedAsset.lt(b, a), "b < a");
            check( !ExtendedAsset.lt(a, b), "b < a");
            check( ExtendedAsset.gt(a, b), "a > b");
            check( !ExtendedAsset.gt(b, a), "a > b");
            check( ExtendedAsset.lte(b, a), "b <= a");
            check( !ExtendedAsset.lte(a, b), "b <= a");
            check( ExtendedAsset.lte(b, new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token'))), "bad value 42");
            check( ExtendedAsset.gte(a, b), "a >= b");
            check( !ExtendedAsset.gte(b, a), "a >= b");
            check( ExtendedAsset.gte(a, new ExtendedAsset(new Asset(5, new Symbol("EOS", 4)), Name.fromString('eosio.token'))), "bad value 43");
        }

        printString('done!\n');
    }
}
