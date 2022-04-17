import {
    Name,
    check,
    Contract
} from "as-chain";

@contract
class MyContract extends Contract{
    @action("test")
    testName(): void {
        check(Name.fromString("").toString() == "", "bad value");
        check(Name.fromString("eosio").toString() == "eosio", "bad value");
        check(Name.fromString("eosio.token").toString() == "eosio.token", "bad value");

        let a = "zzzzzzzzzzzzj";
        check(Name.fromString(a).toString() == a, "bad value");

        {
            let a = Name.fromString("aaa");
            let b = Name.fromString("aab");
            check(a < b, "bad value");
            check(b > a, "bad value");

            check(a <= b, "bad value");
            check(b >= a, "bad value");

            check(a != b, "bad value");
            check(!(a == b), "bad value"); 
        }

        // Cases
        check(Name.fromString(".") == new Name(), "Dot not equal");

        // Check suffix
        check(Name.fromString("eosio").suffix().toString() == "eosio", "bad value - suffix 1");
        check(Name.fromString("").suffix().toString() == "", "bad value - suffix 2");
        check(Name.fromString("eosio.token").suffix().toString() == "token", "bad value - suffix 3");
        check(Name.fromString("a.b").suffix().toString() == "b", "bad value - suffix 4");
        check(Name.fromString("a.b.c").suffix().toString() == "c", "bad value - suffix 5");
        check(Name.fromString("a.b.c.d").suffix().toString() == "d", "bad value - suffix 6");
        check(Name.fromString("a.b.c.d.e").suffix().toString() == "e", "bad value - suffix 7");
        check(Name.fromString("..e").suffix().toString() == "e", "bad value - suffix 8");

        // Check prefix
        check( Name.fromString(".eosioaccounj").prefix().toString() == "", "bad value - prefix 1" )
        check( Name.fromString("e.osioaccounj").prefix() == Name.fromString("e"), "bad value - prefix 2")
        check( Name.fromString("eo.sioaccounj").prefix() == Name.fromString("eo"), "bad value - prefix 3")
        check( Name.fromString("eos.ioaccounj").prefix() == Name.fromString("eos"), "bad value - prefix 4")
        check( Name.fromString("eosi.oaccounj").prefix() == Name.fromString("eosi"), "bad value - prefix 5")
        check( Name.fromString("eosio.accounj").prefix() == Name.fromString("eosio"), "bad value - prefix 6")
        check( Name.fromString("eosioa.ccounj").prefix() == Name.fromString("eosioa"), "bad value - prefix 7")
        check( Name.fromString("eosioac.counj").prefix() == Name.fromString("eosioac"), "bad value - prefix 8")
        check( Name.fromString("eosioacc.ounj").prefix() == Name.fromString("eosioacc"), "bad value - prefix 9")
        check( Name.fromString("eosioacco.unj").prefix() == Name.fromString("eosioacco"), "bad value - prefix 10")
        check( Name.fromString("eosioaccou.nj").prefix() == Name.fromString("eosioaccou"), "bad value - prefix 11")
        check( Name.fromString("eosioaccoun.j").prefix() == Name.fromString("eosioaccoun"), "bad value - prefix 12")
        check( Name.fromString("eosioaccounj.").prefix() == Name.fromString("eosioaccounj"), "bad value - prefix 13")
        check( Name.fromString("eosioaccountj").prefix() == Name.fromString("eosioaccountj"), "bad value - prefix 14")

        check( Name.fromString("e.o.s.i.o.a.c").prefix() == Name.fromString("e.o.s.i.o.a"), "bad value - prefix 15")
        check( Name.fromString("eos.ioa.cco").prefix() == Name.fromString("eos.ioa"), "bad value - prefix 16")

        check( Name.fromString("a.my.account").prefix() == Name.fromString("a.my"), "bad value - prefix 17")
        check( Name.fromString("a.my.account").prefix().prefix() == Name.fromString("a"), "bad value - prefix 18")
    }
}
