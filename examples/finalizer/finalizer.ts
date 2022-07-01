import {
    Name,
    check,
    Contract,
    printString,
} from "as-chain";

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
