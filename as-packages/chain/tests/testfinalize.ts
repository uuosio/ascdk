import {
    Name,
    check,
    Contract,
    printString,
} from "as-chain";

@contract
class MyContract extends Contract{
    @action("test")
    test(): void {
    }

    finalize(): void {
        printString("++++finalizing...");
    }
}
