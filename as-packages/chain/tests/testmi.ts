import {
    Name,
    U128,
    U256,
    IDX64,
    IDXF64,
    IDX128,
    IDX256,
    newSecondaryValue_u64,
    newSecondaryValue_f64,
    newSecondaryValue_U128,
    newSecondaryValue_U256,
    printString,
    check,
    table,
    contract,
    primary,
    secondary,
    action,
    Float128,
} from "as-chain";

@table("mydata")
class MyData {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: U128=new U128(),
        public d: f64=0.0,
        public e: U256=new U256(),
        public f: Float128=new Float128(),
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
    get cvalue(): U128 {
        return this.c;
    }

    @secondary
    set cvalue(value: U128) {
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
    get evalue(): U256 {
        return this.e;
    }

    @secondary
    set evalue(value: U256) {
        this.e = value;
    }

    @secondary
    get fvalue(): Float128 {
        return this.f;
    }

    @secondary
    set fvalue(value: Float128) {
        this.f = value;
    }
}

@contract("hello")
class MyContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("testmi")
    testmi(): void {
        let mi = MyData.new(this.receiver, this.receiver);
        let value = new MyData(1, 2, new U128(3), 3.3, new U256(11));
        mi.store(value, this.receiver);

        value = new MyData(4, 5, new U128(6), 6.6, new U256(44));
        mi.store(value, this.receiver);

        value = new MyData(7, 8, new U128(9), 9.9, new U256(77));
        mi.store(value, this.receiver);

        let it = mi.find(4);
        check(it.isOk(), "value not found!");
        printString(`+++++++++++it.i:${it.i}\n`);
        value = mi.get(it);
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 4 && value.b == 5 && value.c == new U128(6) && value.d == 6.6, "bad value");

        it = mi.previous(it);
        check(it.isOk(), "previous");
        value = mi.get(it);
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 1 && value.b == 2 && value.c == new U128(3) && value.d == 3.3, "bad value");

        it = mi.lowerBound(1);
        value = mi.get(it);
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 1 && value.b == 2 && value.c == new U128(3) && value.d == 3.3, "bad value");

        it = mi.upperBound(1);
        value = mi.get(it);
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 4 && value.b == 5 && value.c == new U128(6) && value.d == 6.6, "bad value");

        it = mi.end();
        it = mi.previous(it);
        value = mi.get(it);
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 7 && value.b == 8 && value.c == new U128(9) && value.d == 9.9, "bad value");

        let idx = <IDX64>mi.getIdxDB(0);
        let idxIt = idx.findPrimary(7);
        printString(`++++++++${idxIt.i.i}, ${idxIt.value}\n`);

        {// 4, 5, 6
            // let idx64 = <IDX64>idx;
            let idx64 = changetype<IDX64>(idx);
            let idxIt = idx64.find(5);
            printString(`+++++++++idx64.find: ${idxIt.i}, ${idxIt.primary}\n`);
            check(idxIt.primary == 4, "bad value");
        }

        // 1 2 3
        // 4 5 6
        // 7 8 9
        {
            let secondary = newSecondaryValue_u64(2);
            let ret = idx.lowerBoundEx(secondary);
            check(ret.value == 2, "bad value");
            ret = idx.upperBoundEx(2);
            check(ret.value == 5, "bad value");

            let it = idx.previous(ret.i);
            check(it.primary == 1, "bad primary value");
            it = idx.next(it);
            check(it.primary == 4, "bad primary value");

            it = idx.end();
            it = idx.previous(it);
            printString(`++++++${it.i}, ${it.primary}\n`);
            check(it.primary == 7, "bad primary value");
        }

        {// 1, 2, 3
            let idxIt = idx.find(2);
            printString(`+++++++++idx.find(2): ${idxIt.i}, ${idxIt.primary}\n`);
            check(idxIt.primary == 1, "bad value");
            let secValue = newSecondaryValue_u64(22);
            mi.idxUpdate(idxIt, secValue, this.receiver);
            let ret = idx.find(22);
            check(ret.isOk(), "bad scondary value");
        }

        // 1 22 3 3.3
        // 4 5 6 6.6
        // 7 8 9 9.9
        {
            let idx128 = <IDX128>mi.getIdxDB(1);
            let idxRet = idx128.findPrimary(1);
            check(idxRet.value == new U128(3), "bad idx128 value");
            let it = idx128.previous(idxRet.i);
            check(it.i == -1, 'bad iterator');

            it = idx128.next(idxRet.i);
            check(it.primary == 4, "bad primary value!");

            it = idx128.lowerBound(new U128(6));
            check(it.primary == 4, "idx128.lowerBound: bad primary value!");

            it = idx128.upperBound(new U128(6));
            check(it.primary == 7, "idx128.lowerBound: bad primary value!");

            let secondary = newSecondaryValue_U128(new U128(6));
            let ret = idx128.lowerBoundEx(secondary);
            check(ret.value.value[0] == 6, "idx128.lowerBound 1: bad secondary value!");

            ret = idx128.upperBoundEx(secondary);
            check(ret.value.value[0] == 9, "idx128.lowerBound 2: bad secondary value!");
        }

        // 1 22 3 3.3 11
        // 4 5 6 6.6 
        // 7 8 9 9.9
        {
            let idxf64 = <IDXF64>mi.getIdxDB(2);
            let idxRet = idxf64.findPrimary(1);
            check(idxRet.value == 3.3, "bad idx128 value");
            let it = idxf64.previous(idxRet.i);
            check(it.i == -1, 'bad iterator');

            it = idxf64.next(idxRet.i);
            check(it.primary == 4, "bad primary value!");

            it = idxf64.lowerBound(3.3);
            check(it.isOk() && it.primary == 1, "idx128.lowerBound: bad primary value!");

            let secondary = newSecondaryValue_f64(6.6);
            let ret = idxf64.lowerBoundEx(secondary);
            check(ret.i.isOk(), "bad iterator");
            check(ret.value == 6.6, "idx128.lowerBound 3: bad secondary value!");

            it = idxf64.upperBound(6.6);
            check(it.primary == 7, "idx128.lowerBound: bad primary value!");

            ret = idxf64.upperBoundEx(secondary);
            check(ret.value == 9.9, "idx128.lowerBound 4: bad secondary value!");
        }

        // 1 22 3 3.3 11
        // 4 5 6 6.6 44
        // 7 8 9 9.9 77
        {
            let idx256 = <IDX256>mi.getIdxDB(3);
            let idxRet = idx256.findPrimary(1);
            check(idxRet.value == new U256(11), "bad idx128 value");
            let it = idx256.previous(idxRet.i);
            check(it.i == -1, 'bad iterator');

            it = idx256.next(idxRet.i);
            check(it.primary == 4, "bad primary value!");

            it = idx256.lowerBound(new U256(44));
            check(it.primary == 4, "idx256.lowerBound: bad primary value!");

            it = idx256.upperBound(new U256(44));
            check(it.primary == 7, "idx256.lowerBound: bad primary value!");

            let secondary = newSecondaryValue_U256(new U256(44));
            let ret = idx256.lowerBoundEx(secondary);
            check(ret.value.value[0] == 44, "idx256.lowerBound 1: bad secondary value!");

            ret = idx256.upperBoundEx(secondary);
            check(ret.value.value[0] == 77, "idx256.lowerBound 2: bad secondary value!");
        }

        value = new MyData(7, 88, new U128(99), 9.99);
        mi.update(it, value, this.receiver);
        value = mi.get(it);
        check(value.a == 7 && value.b == 88 && value.c == new U128(99) && value.d == 9.99, "bad value");

        // 1 22 3
        // 4 5 6
        // 7 8 10
        {
            let it = mi.find(1);
            mi.remove(it);
            it = mi.find(1);
            check(!it.isOk(), "bad iterator!");
        }
    }
}
