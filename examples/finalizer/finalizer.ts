import {
    Name,
    check,
    Contract,
    printString,
} from "asm-chain";

@contract
class MyContract extends Contract{
    @action("sayhello")
    sayHello(): void {
        printString("hello, world!\n");
    }

    finalize(): void {
        printString("goodbye, world!\n");
    }
}
