import {
    primary,
    table,
    contract,
    action,

    Name,
    Table,
    Contract,
    print,
} from "as-chain";

@table("counter")
class Counter extends Table {
    public key: u64;
    public count: u64;
    constructor(count: u64=0) {
        super();
        this.count = count;
        this.key = Name.fromString("counter").N;
    }

    @primary
    get primary(): u64 {
        return this.key;
    }
}

@contract("mycontract")
class MyContract extends Contract {
    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        super(receiver, firstReceiver, action);
    }

    @action("inc")
    inc(): void {
        let mi = Counter.new(this.receiver, this.receiver);
        let it = mi.find(Name.fromString("counter").N);
        var counter: Counter;
        if (it.isOk()) {
            counter = mi.get(it);
        } else {
            counter = new Counter(0);
        }
        
        counter.count += 1;
        print(`++++++++count:${counter.count}`);

        let payer: Name = this.receiver;
        if (it.isOk()) {
            mi.update(it, counter, payer);
        } else {
            mi.store(counter, payer);
        }
    }
}
