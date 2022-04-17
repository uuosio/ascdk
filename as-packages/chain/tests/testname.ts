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

        // Check suffix
        check(Name.fromString("eosio").suffix().toString() == "eosio", "bad value - suffix 1");
        check(Name.fromString("").suffix().toString() == "", "bad value - suffix 2");
        check(Name.fromString("eosio.token").suffix().toString() == "token", "bad value - suffix 3");
        check(Name.fromString("a.b").suffix().toString() == "b", "bad value - suffix 4");
        check(Name.fromString("a.b.c").suffix().toString() == "c", "bad value - suffix 5");
        check(Name.fromString("a.b.c.d").suffix().toString() == "d", "bad value - suffix 6");
        check(Name.fromString("a.b.c.d.e").suffix().toString() == "e", "bad value - suffix 7");

        // Check prefix
        check(Name.fromString("eosio").prefix().toString() == "eosio", "bad value - prefix 1");
        check(Name.fromString("").prefix().toString() == "", "bad value - prefix 2");
        check(Name.fromString("eosio.token").prefix().toString() == "eosio", "bad value - prefix 3");
        check(Name.fromString("a.b").prefix().toString() == "a", "bad value - prefix 4");
        check(Name.fromString("a.b.c").prefix().toString() == "a.b", "bad value - prefix 5");
        check(Name.fromString("a.b.c.d").prefix().toString() == "a.b.c", "bad value - prefix 6");
        check(Name.fromString("a.b.c.d.e").prefix().toString() == "a.b.c.d", "bad value - suffix 7");
    }
}
