import * as chain from "as-chain"

@contract("hello")
class MyContract {
    constructor(
        public receiver: chain.Name,
        public firstReceiver: chain.Name,
        public action: chain.Name) {
    }

    @action("sayhello")
    sayHello():  void {
        chain.printString("hello, world!");
    }
}
