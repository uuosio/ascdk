import { print, Name } from "as-chain"

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
