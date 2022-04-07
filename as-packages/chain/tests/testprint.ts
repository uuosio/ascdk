import {
    prints,
    printui,
    print, printString, printArray, printHex, printi,
    printI128,
    printU128,
    printsf,
    printdf,
    printqf,
    printn,
    Float128,
    Contract,
} from "as-chain";

@contract
class MyContract extends Contract{
    @action("test")
    testPrint(
        a1: Float128
    ): void {
        printqf(a1);
    }
}
