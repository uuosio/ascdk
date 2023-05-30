import { print, Name } from "asm-chain"

@contract
class MyContract {
    constructor(
        public receiver: Name,
        public firstReceiver: Name,
        public action: Name) {
    }

    @action("sayhello")
    sayHello():  void {
        print("hello, world!");
    }
}
