import {
    print,
    Contract,
    action,
    contract,
} from "as-chain";

@contract("hello")
class MyContract extends Contract {
    @action("sayhello", notify=true)
    sayHello(name: string): void {
        print(`notify: hello ${name}!`);
    }
}