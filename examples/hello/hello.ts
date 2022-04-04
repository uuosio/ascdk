import { print, Name } from "as-chain"

@contract("hello")
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
