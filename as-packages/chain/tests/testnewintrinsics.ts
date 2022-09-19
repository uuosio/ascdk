import {
    currentBlockNum,
    print,
    check,
    Contract,
} from "as-chain";

@contract
class MyContract extends Contract {
    @action("test")
    Test(num: u32): void {
        check(currentBlockNum() == num, "currentBlockNum() == num");
        print(`Done!`);
    }
}
