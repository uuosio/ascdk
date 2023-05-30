import {
    Name,
    Contract,

    check,
    print,
    currentTimeMs,
} from "asm-chain";

@contract
class MyContract extends Contract{
    @action("test")
    testName(): void {
        let time = currentTimeMs();
        print(`+++++++++++++time: ${time}\n`);
    }
}
