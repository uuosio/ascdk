import {
    Name,
    Contract,
    print,
} from "asm-chain";

@table("counter")
class Counter {
    public key: u64;
    public count: u64;
    constructor(count: u64=0) {
        this.count = count;
        this.key = Name.fromString("counter").N;
    }

    @primary
    get primary(): u64 {
        return this.key;
    }
}

@contract
class MyContract extends Contract {
    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        super(receiver, firstReceiver, action);
    }

    @action("inc")
    inc(): void {
        let mi = Counter.new(this.receiver);
        let it = mi.find(Name.fromString("counter").N);
        let count: u64 = 0;
        let payer: Name = this.receiver;

        if (it.isOk()) {
            let counter = mi.get(it)
            counter.count += 1;
            mi.update(it, counter, payer);
            count = counter.count;
        } else {
            let counter = new Counter(1);
            mi.store(counter, payer);
            count = 1;
        }
        print(`++++++++count:${count}`);
    }
}
