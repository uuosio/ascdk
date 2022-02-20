import * as chain from "as-chain"

@table("mydata")
class MyData {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: chain.U128=new chain.U128(),
        public d: f64=0.0,
        public e: chain.U256=new chain.U256(),
        ) {
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

    @secondary
    get cvalue(): chain.U128 {
        return this.c;
    }

    @secondary
    set cvalue(value: chain.U128) {
        this.c = value;
    }

    @secondary
    get dvalue(): f64 {
        return this.d;
    }

    @secondary
    set dvalue(value: f64) {
        this.d = value;
    }

    @secondary
    get evalue(): chain.U256 {
        return this.e;
    }

    @secondary
    set evalue(value: chain.U256) {
        this.e = value;
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
        let mi = MyData.newMultiIndex(this.receiver, this.receiver);
        let value = new MyData(1, 2, new chain.U128(3), 3.3, new chain.U256(11));
        mi.store(value, this.receiver);

        value = new MyData(4, 5, new chain.U128(6), 6.6, new chain.U256(44));
        mi.store(value, this.receiver);

        value = new MyData(7, 8, new chain.U128(9), 9.9, new chain.U256(77));
        mi.store(value, this.receiver);

        let it = mi.find(4);
        chain.assert(it.isOk(), "value not found!");
        chain.printString(`+++++++++++it.i:${it.i}\n`);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        chain.assert(value.a == 4 && value.b == 5 && value.c == new chain.U128(6) && value.d == 6.6, "bad value");

        it = mi.previous(it);
        chain.assert(it.isOk(), "previous");
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        chain.assert(value.a == 1 && value.b == 2 && value.c == new chain.U128(3) && value.d == 3.3, "bad value");

        it = mi.lowerBound(1);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        chain.assert(value.a == 1 && value.b == 2 && value.c == new chain.U128(3) && value.d == 3.3, "bad value");

        it = mi.upperBound(1);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        chain.assert(value.a == 4 && value.b == 5 && value.c == new chain.U128(6) && value.d == 6.6, "bad value");

        it = mi.end();
        it = mi.previous(it);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`)
        chain.assert(value.a == 7 && value.b == 8 && value.c == new chain.U128(9) && value.d == 9.9, "bad value");

        let idx = <chain.IDX64>mi.getIdxDB(0);
        let idxIt = idx.findPrimary(7);
        chain.printString(`++++++++${idxIt.i.i}, ${idxIt.value}\n`)

        {//4, 5, 6
            // let idx64 = <chain.IDX64>idx;
            let idx64 = changetype<chain.IDX64>(idx);
            let idxIt = idx64.find(5);
            chain.printString(`+++++++++idx64.find: ${idxIt.i}, ${idxIt.primary}\n`)
            chain.assert(idxIt.primary == 4, "bad value");
        }

        //1 2 3
        //4 5 6
        //7 8 9
        {
            let secondary = chain.newSecondaryValue_u64(2);
            let ret = idx.lowerBoundEx(secondary);
            chain.assert(ret.value == 2, "bad value");
            ret = idx.upperBoundEx(2);
            chain.assert(ret.value == 5, "bad value");

            let it = idx.previous(ret.i);
            chain.assert(it.primary == 1, "bad primary value");
            it = idx.next(it);
            chain.assert(it.primary == 4, "bad primary value");

            it = idx.end();
            it = idx.previous(it);
            chain.printString(`++++++${it.i}, ${it.primary}\n`);
            chain.assert(it.primary == 7, "bad primary value");
        }

        {//1, 2, 3
            let idxIt = idx.find(2);
            chain.printString(`+++++++++idx.find(2): ${idxIt.i}, ${idxIt.primary}\n`);
            chain.assert(idxIt.primary == 1, "bad value");
            let secValue = chain.newSecondaryValue_u64(22);
            mi.idxUpdate(idxIt, secValue, this.receiver);
            let ret = idx.find(22);
            chain.assert(ret.isOk(), "bad scondary value");
        }

        //1 22 3 3.3
        //4 5 6 6.6
        //7 8 9 9.9
        {
            let idx128 = <chain.IDX128>mi.getIdxDB(1);
            let idxRet = idx128.findPrimary(1);
            chain.assert(idxRet.value == new chain.U128(3), "bad idx128 value");
            let it = idx128.previous(idxRet.i);
            chain.assert(it.i == -1, 'bad iterator');

            it = idx128.next(idxRet.i);
            chain.assert(it.primary == 4, "bad primary value!");

            it = idx128.lowerBound(new chain.U128(6));
            chain.assert(it.primary == 4, "idx128.lowerBound: bad primary value!");

            it = idx128.upperBound(new chain.U128(6));
            chain.assert(it.primary == 7, "idx128.lowerBound: bad primary value!");

            let secondary = chain.newSecondaryValue_U128(new chain.U128(6));
            let ret = idx128.lowerBoundEx(secondary);
            chain.assert(ret.value.value[0] == 6, "idx128.lowerBound 1: bad secondary value!");

            ret = idx128.upperBoundEx(secondary);
            chain.assert(ret.value.value[0] == 9, "idx128.lowerBound 2: bad secondary value!");
        }

        //1 22 3 3.3 11
        //4 5 6 6.6 
        //7 8 9 9.9
        {
            let idxf64 = <chain.IDXF64>mi.getIdxDB(2);
            let idxRet = idxf64.findPrimary(1);
            chain.assert(idxRet.value == 3.3, "bad idx128 value");
            let it = idxf64.previous(idxRet.i);
            chain.assert(it.i == -1, 'bad iterator');

            it = idxf64.next(idxRet.i);
            chain.assert(it.primary == 4, "bad primary value!");

            it = idxf64.lowerBound(3.3);
            chain.assert(it.isOk() && it.primary == 1, "idx128.lowerBound: bad primary value!");

            let secondary = chain.newSecondaryValue_f64(6.6);
            let ret = idxf64.lowerBoundEx(secondary);
            chain.assert(ret.i.isOk(), "bad iterator");
            chain.assert(ret.value == 6.6, "idx128.lowerBound 3: bad secondary value!");

            it = idxf64.upperBound(6.6);
            chain.assert(it.primary == 7, "idx128.lowerBound: bad primary value!");

            ret = idxf64.upperBoundEx(secondary);
            chain.assert(ret.value == 9.9, "idx128.lowerBound 4: bad secondary value!");
        }

        //1 22 3 3.3 11
        //4 5 6 6.6 44
        //7 8 9 9.9 77
        {
            let idx256 = <chain.IDX256>mi.getIdxDB(3);
            let idxRet = idx256.findPrimary(1);
            chain.assert(idxRet.value == new chain.U256(11), "bad idx128 value");
            let it = idx256.previous(idxRet.i);
            chain.assert(it.i == -1, 'bad iterator');

            it = idx256.next(idxRet.i);
            chain.assert(it.primary == 4, "bad primary value!");

            it = idx256.lowerBound(new chain.U256(44));
            chain.assert(it.primary == 4, "idx256.lowerBound: bad primary value!");

            it = idx256.upperBound(new chain.U256(44));
            chain.assert(it.primary == 7, "idx256.lowerBound: bad primary value!");

            let secondary = chain.newSecondaryValue_U256(new chain.U256(44));
            let ret = idx256.lowerBoundEx(secondary);
            chain.assert(ret.value.value[0] == 44, "idx256.lowerBound 1: bad secondary value!");

            ret = idx256.upperBoundEx(secondary);
            chain.assert(ret.value.value[0] == 77, "idx256.lowerBound 2: bad secondary value!");
        }

        value = new MyData(7, 88, new chain.U128(99), 9.99);
        mi.update(it, value, this.receiver);
        value = mi.get(it);
        chain.assert(value.a == 7 && value.b == 88 && value.c == new chain.U128(99) && value.d == 9.99, "bad value");

        // 1 22 3
        // 4 5 6
        // 7 8 10
        {
            let it = mi.find(1);
            mi.remove(it);
            it = mi.find(1);
            chain.assert(!it.isOk(), "bad iterator!");
        }
    }
}
