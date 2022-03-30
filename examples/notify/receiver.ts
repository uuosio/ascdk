import {
    print,
    Contract,
} from "as-chain";

@contract("hello")
class MyContract extends Contract {
    @action("sayhello", notify)
    sayHello(name: string): void {
        print(`notify: hello ${name}!`);
    }
}
