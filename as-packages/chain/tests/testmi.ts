import {
    Name,
    Table,
    U128,
    U256,
    newSecondaryValue_u64,
    newSecondaryValue_f64,
    newSecondaryValue_U128,
    newSecondaryValue_U256,
    getSecondaryValue_Float128,
    printString,
    printHex,
    check,
    Float128,
    Contract,
    print,
    newSecondaryValue_Float128,
} from "as-chain";

@table("mydata")
class MyData extends Table {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: U128=new U128(),
        public d: f64=0.0,
        public e: U256=new U256(),
        public f: Float128=new Float128(),
    ) {
        super();
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

@table("mydata1")
class MyData1 extends Table {
    constructor(
        public a: u64=0,
        public b: u64=0,
    ) {
        super();
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

@table("mydata2")
class MyData2 extends Table {
    constructor(
        public a: u64=0,
        public b: u64=0,
    ) {
        super();
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

@contract
class MyContract extends Contract{
    @action("testmi1")
    testmi1(): void {
        let mi = MyData.new(this.receiver);
        let value = new MyData(
                            1,
                            2,
                            new U128(3),
                            3.3,
                            new U256(11),
                            new Float128(0x5000000000000000, 0x4012e847ffffeb07)//999999.99999
                        );
        mi.store(value, this.receiver);
        printHex(new U256(11).pack());
    }

    @action("testmi2")
    testmi2(): void {
        let mi = MyData.new(this.receiver);
        check(mi.availablePrimaryKey() == 0, `expected availablePrimaryKey 0, got ${mi.availablePrimaryKey()}`);

        mi = MyData.new(this.receiver, this.receiver);

        let value = new MyData(1, 2, new U128(3), 3.3, new U256(11), new Float128(0xaa));
        mi.store(value, this.receiver);
        check(mi.availablePrimaryKey() == 2, `expected availablePrimaryKey 2, got ${mi.availablePrimaryKey()}`);

        value = new MyData(4, 5, new U128(6), 6.6, new U256(44), new Float128(0xbb));
        mi.store(value, this.receiver);
        check(mi.availablePrimaryKey() == 5, `expected availablePrimaryKey 5, got ${mi.availablePrimaryKey()}`);

        value = new MyData(7, 8, new U128(9), 9.9, new U256(77), new Float128(0xcc));
        mi.store(value, this.receiver);
        check(mi.availablePrimaryKey() == 8, `expected availablePrimaryKey 8, got ${mi.availablePrimaryKey()}`);

        let it = mi.find(4);
        check(it.isOk(), "value not found!");
        printString(`+++++++++++it.i:${it.i}\n`);
        value = it.getValue()!;
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 4 && value.b == 5 && value.c == new U128(6) && value.d == 6.6, "bad value 1");

        it = mi.previous(it);
        check(it.isOk(), "previous");
        value = it.getValue()!;
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 1 && value.b == 2 && value.c == new U128(3) && value.d == 3.3, "bad value 2");

        it = mi.lowerBound(1);
        value = it.getValue()!;
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 1 && value.b == 2 && value.c == new U128(3) && value.d == 3.3, "bad value 3");

        it = mi.upperBound(1);
        value = it.getValue()!;
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 4 && value.b == 5 && value.c == new U128(6) && value.d == 6.6, "bad value 4");

        it = mi.end();
        it = mi.previous(it);
        value = it.getValue()!;
        printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`);
        check(value.a == 7 && value.b == 8 && value.c == new U128(9) && value.d == 9.9, "bad value 5");

        print("++++++++++++++test IDX64++++++++++++++\n");
        {
            let idx = mi.bvalueDB;
            let idxIt = idx.findPrimary(7);
            printString(`++++++++${idxIt.i.i}, ${idxIt.value}\n`);
    
            {// 4, 5, 6
                // let idx64 = <IDX64>idx;
                let idxIt = idx.find(5);
                printString(`+++++++++idx64.find: ${idxIt.i}, ${idxIt.primary}\n`);
                check(idxIt.primary == 4, "bad value 6");
            }
    
            // 1 2 3
            // 4 5 6
            // 7 8 9
            {
                let secondary = newSecondaryValue_u64(2);
                let ret = idx.lowerBoundEx(secondary);
                check(ret.value == 2, "bad value 7");
                ret = idx.upperBoundEx(2);
                check(ret.value == 5, "bad value 8");
    
                let it = idx.previous(ret.i);
                check(it.primary == 1, "bad primary value");
                it = idx.next(it);
                check(it.primary == 4, "bad primary value");
    
                it = idx.end();
                it = idx.previous(it);
                printString(`++++++${it.i}, ${it.primary}\n`);
                check(it.primary == 7, "bad primary value");
            }
        }

        print("++++++++++++++test IDX128 ++++++++++++++\n");
        // 1 2 3 3.3
        // 4 5 6 6.6
        // 7 8 9 9.9
        {
            let idx128 = mi.cvalueDB;
            let idxRet = idx128.findPrimary(1);
            check(idxRet.value == new U128(3), "bad idx128 value");
            {
                let itIdx = idx128.find(new U128(3));
                check(itIdx.isOk(), "bad idx128 iterator.");
                check(itIdx.primary == 1, "bad idx128 iterator.");
    
                itIdx = idx128.find(new U128(6));
                check(itIdx.isOk(), "bad idx128 iterator.");
                check(itIdx.primary == 4, "bad idx128 iterator.");
            }

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

        print("++++++++++++++test IDXF64 ++++++++++++++\n");
        // 1 2 3 3.3 11
        // 4 5 6 6.6 
        // 7 8 9 9.9
        {
            let idxf64 = mi.dvalueDB;
            let idxRet = idxf64.findPrimary(1);
            check(idxRet.value == 3.3, "bad idx128 value");

            {
                let itIdx = idxf64.find(3.3);
                check(itIdx.isOk(), "bad idxf64 iterator.");
                check(itIdx.primary == 1, "bad idxf64 iterator.");
    
                itIdx = idxf64.find(6.6);
                check(itIdx.isOk(), "bad idxf64 iterator.");
                check(itIdx.primary == 4, "bad idxf64 iterator.");
            }

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

        print("++++++++++++++test IDX256 ++++++++++++++");
        // 1 2 3 3.3 11
        // 4 5 6 6.6 44
        // 7 8 9 9.9 77
        {
            let idx256 =mi.evalueDB;
            let idxRet = idx256.findPrimary(1);
            check(idxRet.value == new U256(11), "bad idx256 value");

            {
                let itIdx = idx256.find(new U256(11));
                check(itIdx.isOk(), "bad idx256 iterator.");
                check(itIdx.primary == 1, "bad idx256 iterator.");
    
                itIdx = idx256.find(new U256(44));
                check(itIdx.isOk(), "bad idx256 iterator.");
                check(itIdx.primary == 4, "bad idx256 iterator.");
            }

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

        print("++++++++++++++test IDXFloat128 ++++++++++++++");
        // 1 2 3 3.3 11 3.33
        // 4 5 6 6.6 44 6.66
        // 7 8 9 9.9 77 9.99
        {
            let idxf128 =mi.fvalueDB;
            let idxRet = idxf128.findPrimary(1);
            check(idxRet.value == new Float128(0xaa), "bad idxf128 value");
 
            {
                let itIdx = idxf128.find(new Float128(0xaa));
                check(itIdx.isOk(), "bad idxf128 iterator.");
                check(itIdx.primary == 1, "bad idxf128 iterator.");
    
                itIdx = idxf128.find(new Float128(0xbb));
                check(itIdx.isOk(), "bad idxf128 iterator.");
                check(itIdx.primary == 4, "bad idxf128 iterator.");
            }
 
            let it = idxf128.previous(idxRet.i);
            check(it.i == -1, 'bad iterator');

            it = idxf128.next(idxRet.i);
            check(it.primary == 4, "bad primary value!");
            it = idxf128.lowerBound(new Float128(0xbb));
            check(it.primary == 4, "idxf128.lowerBound: bad primary value!");

            it = idxf128.upperBound(new Float128(0xbb));
            check(it.primary == 7, "idxf128.lowerBound: bad primary value!");

            let ret = idxf128.lowerBoundEx(newSecondaryValue_Float128(new Float128(0xbb)));
            let value = getSecondaryValue_Float128(ret.value);
            check(value == new Float128(0xbb), "idxf128.lowerBound 1: bad secondary value!");

            ret = idxf128.upperBoundEx(newSecondaryValue_Float128(new Float128(0xbb)));
            value = getSecondaryValue_Float128(ret.value);
            check(value == new Float128(0xcc), "idxf128.lowerBound 2: bad secondary value!");
        }

        print("++++++++++++++test IdxUpdate++++++++++++++");
        // 1 2 3 3.3 11
        {
            let idx = mi.bvalueDB;
            let idxIt = idx.find(2);
            printString(`+++++++++idx.find(2): ${idxIt.i}, ${idxIt.primary}\n`);
            check(idxIt.primary == 1, "bad value 9");
            mi.updateBvalue(idxIt, 22, this.receiver);
            let ret = idx.find(22);
            check(ret.isOk(), "bad scondary value 10");
        }

        // 1 2 3 3.3 11
        {
            let idx = mi.cvalueDB;
            let idxIt = idx.find(new U128(3));
            printString(`+++++++++idx.find(3): ${idxIt.i}, ${idxIt.primary}\n`);
            check(idxIt.primary == 1, "bad value 11");
            mi.updateCvalue(idxIt, new U128(33), this.receiver);
            let ret = idx.find(new U128(33));
            check(ret.isOk(), "bad scondary value 12");
        }

        // 1 22 33 3.3 11
        {
            let idx = mi.dvalueDB;
            let idxIt = idx.find(3.3);
            printString(`+++++++++idx.find(3.3): ${idxIt.i}, ${idxIt.primary}\n`);
            check(idxIt.primary == 1, "bad value 13");
            mi.updateDvalue(idxIt, 3.33, this.receiver);
            let ret = idx.find(3.33);
            check(ret.isOk(), "bad scondary value");
        }

        // 1 22 33 3.33 11
        {
            let idx = mi.evalueDB;
            let idxIt = idx.find(new U256(11));
            printString(`+++++++++idx.find(11): ${idxIt.i}, ${idxIt.primary}\n`);
            check(idxIt.primary == 1, "bad value 14");
            mi.updateEvalue(idxIt, new U256(111), this.receiver);
            let ret = idx.find(new U256(111));
            check(ret.isOk(), "bad scondary value");
        }

        value = new MyData(7, 88, new U128(99), 9.99);
        mi.update(it, value, this.receiver);
        value = it.getValue()!;
        check(value.a == 7 && value.b == 88 && value.c == new U128(99) && value.d == 9.99, "bad value 15");

        // 1 2 3 3.3 11
        {
            let it = mi.find(1);
            mi.remove(it);
            it = mi.find(1);
            check(!it.isOk(), "bad iterator!");
        }
    }

    @action("testend")
    testend(): void {
        let mi1 = MyData1.new(this.receiver);
        let mi2 = MyData2.new(this.receiver);
        let it1 = mi1.find(1);
        let it2 = mi2.find(1);
        if (!it1.isOk()) {
            mi1.store(new MyData1(1), this.receiver);
        } else {
            let itEnd = mi1.end();
            printString(`++++itEnd.i:${itEnd.i}\n`);
            check(itEnd.isEnd(), "bad end 1");

            let idx = mi1.bvalueDB;
            let itIdxEnd = idx.end();
            printString(`++++itIdxEnd.i:${itIdxEnd.i}\n`);
            check(itIdxEnd.isEnd(), "bad idx end 1");
        }

        if (!it2.isOk()) {
            mi2.store(new MyData2(1), this.receiver);
        } else {
            let itEnd = mi2.end();
            printString(`it.End.i:${itEnd.i}\n`);

            let idx = mi2.bvalueDB;
            let itIdxEnd = idx.end();
            printString(`++++itIdxEnd.i:${itIdxEnd.i}\n`);
            check(itIdxEnd.isEnd(), "bad idx end 2");
        }
    }
}
