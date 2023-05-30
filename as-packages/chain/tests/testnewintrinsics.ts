import {
    currentBlockNum,
    print,
    check,
    Contract,
} from "asm-chain";

@contract
class MyContract extends Contract {
    @action("test")
    Test(num: u32): void {
        check(currentBlockNum() == num, "currentBlockNum() == num");
        print(`Done!`);
    }
}
