import {
    print,
    requireRecipient,
    Name,
    Contract,
} from "asm-chain";

@contract
class MyContract extends Contract {
    @action("sayhello")
    sayHello(name: string): void {
        print(`hello ${name}!`);
        requireRecipient(Name.fromString('helloworld11'));
    }
}
