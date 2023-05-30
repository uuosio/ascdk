import {
    print,
    Contract,
} from "asm-chain";

@contract
class MyContract extends Contract {
    @action("sayhello", notify)
    sayHello(name: string): void {
        print(`notify: hello ${name}!`);
    }
}
