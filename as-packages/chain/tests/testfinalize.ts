import {
    Name,
    check,
    Contract,
    printString,
} from "asm-chain";

@contract
class MyContract extends Contract{
    @action("test")
    test(): void {
    }

    finalize(): void {
        printString("++++finalizing...");
    }
}
