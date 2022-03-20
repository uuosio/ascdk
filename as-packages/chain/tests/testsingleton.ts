import {
    primary,
    table,
    contract,
    action,
    singleton,

    Name,
    Table,
    Contract,
    print,
    check,
} from "as-chain";

@table("counter", singleton)
class Counter extends Table {
    public count: u64;
    constructor(count: u64=0) {
        super();
        this.count = count;
    }
}

@contract("mycontract")
class MyContract extends Contract {
    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        super(receiver, firstReceiver, action);
    }

    @action("test")
    test(): void {
        let payer = this.receiver;
        {
            let db = Counter.new(this.receiver, this.receiver);
            let value = db.get();
            check(value == null, "bad value");
        }

        {
            let db = Counter.new(this.receiver, this.receiver);
            let value = db.getOrDefault();
            check(value.count == 0, "bad value");
            value.count += 1;
            db.set(value, payer);
            print(`+++++++++${value.count}`);    
        }

        {
            let db = Counter.new(this.receiver, this.receiver);
            let value = db.getOrDefault()
            check(value.count == 1, "bad value");
            
            db.remove()
            value = db.getOrDefault()
            check(value.count == 0, "bad value");
        }
    }
}
