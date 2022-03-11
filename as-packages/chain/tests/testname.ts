import {
    print,
    Name,
    check,
    Contract,
} from "as-chain";

@contract("hello")
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
    }
}
