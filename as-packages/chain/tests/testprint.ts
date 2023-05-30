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

    U256,
} from "asm-chain";

@contract
class MyContract extends Contract{
    @action("test")
    testPrint(
        a1: Float128
    ): void {
        print(U256.fromU64(90001).toString(10))
        print((90).toString(16))
        printqf(a1);
    }
}
