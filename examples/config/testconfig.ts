import { print, Name } from "asm-chain"
import { CONFIG } from "./.env"

@contract
class MyContract {
    constructor(
        public receiver: Name,
        public firstReceiver: Name,
        public action: Name) {
    }

    @action("test")
    test():  void {
        print(`config: ${CONFIG}`);
    }
}
