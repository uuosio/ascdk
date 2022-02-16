import * as chain from "as-chain"

@table("mydata")
class MyData {
    a: u64;
    b: u64;
    c: u64;
    constructor(a: u64=0, b: u64=0, c: u64=0) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    @primary
    get getPrimary(): u64 {
        return this.a;
    }

    @secondary
    get bvalue(): u64 {
        return this.b;
    }

    @secondary
    set bvalue(value: u64) {
        this.b = value;
    }

}

@contract("hello")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("testmi")
    testmi(): void {
        let newObj = (): MyData => {
            return new MyData();
        }
        let indexes = [chain.SecondaryType.U64]
        let mi = new chain.MultiIndex<MyData>(this.receiver, this.firstReceiver, this.action, indexes, newObj);
        let value = new MyData(1, 2, 3);
        mi.store(value, this.receiver);

        value = new MyData(4, 5, 6);
        mi.store(value, this.receiver);

        value = new MyData(7, 8, 9);
        mi.store(value, this.receiver);

        let it = mi.find(4);
        chain.assert(it.isOk(), "value not found!")
        chain.printString(`+++++++++++it.i:${it.i}`)
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}`)
        chain.assert(value.a == 4 && value.b == 5 && value.c == 6, "bad value");

        it = mi.previous(it);
        chain.assert(it.isOk(), "previous");
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}`)
        chain.assert(value.a == 1 && value.b == 2 && value.c == 3, "bad value");

        it = mi.lowerBound(1);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}`)
        chain.assert(value.a == 1 && value.b == 2 && value.c == 3, "bad value");

        it = mi.upperBound(1);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}`)
        chain.assert(value.a == 4 && value.b == 5 && value.c == 6, "bad value");

        it = mi.end();
        it = mi.previous(it);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}`)
        chain.assert(value.a == 7 && value.b == 8 && value.c == 9, "bad value");

        value.c = 10;
        mi.update(it, value, this.receiver);
        value = mi.get(it);        
        chain.assert(value.a == 7 && value.b == 8 && value.c == 10, "bad value");

        mi.remove(it);
        it = mi.find(7);
        chain.assert(!it.isOk(), "bad value");

    }
}
