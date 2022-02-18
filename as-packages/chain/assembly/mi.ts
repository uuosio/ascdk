import { IDXDB, SecondaryType, SecondaryValue, SecondaryIterator } from "./idxdb"
import { DBI64, PrimaryValue } from "./dbi64"
import { IDX64 } from "./idx64"
import { IDXF64 } from "./idxf64"
import { IDX128 } from "./idx128"
import { IDX256 } from "./idx256"
import { Name } from "./name"
import { printString } from "./debug"
import { assert } from "./system"

export class PrimaryIterator {
    constructor(public i: i32) {}

    isOk(): bool {
        return this.i >= 0;
    }

    isEnd(): bool {
        return this.i == -2;
    }
}

export interface MultiIndexValue extends PrimaryValue {
    getSecondaryValue(index: usize): SecondaryValue;
    setSecondaryValue(index: usize, value: SecondaryValue): void;
}

export class MultiIndex<T extends MultiIndexValue> {
    db: DBI64;
    idxdbs: Array<IDXDB>;
    newObj: () => T;
    constructor(code: Name, scope: Name, table: Name, indexes: Array<SecondaryType>, newObj: () => T) {
        this.db = new DBI64(code.N, scope.N, table.N);
        this.idxdbs = new Array<IDXDB>(indexes.length);
        this.newObj = newObj;
        if (indexes) {
            for (let i=0; i<indexes.length; i++) {
                let idxTable = (table.N & 0xfffffffffffffff0) + i;
                if (indexes[i] == SecondaryType.U64) {
                    this.idxdbs[i] = new IDX64(code.N, scope.N, idxTable, i);
                } else if (indexes[i] == SecondaryType.U128) {
                    this.idxdbs[i] = new IDX128(code.N, scope.N, idxTable, i);
                } else if (indexes[i] == SecondaryType.U256) {
                    this.idxdbs[i] = new IDX256(code.N, scope.N, idxTable, i);
                } else if (indexes[i] == SecondaryType.F64) {
                    this.idxdbs[i] = new IDXF64(code.N, scope.N, idxTable, i);
                } else if (indexes[i] == SecondaryType.F128) {
                }
            }
        }
    }

    store(value: T, payer: Name): PrimaryIterator {
        let it = this.db.store(value.getPrimaryValue(), value.pack(), payer.N);
        for (let i=0; i<this.idxdbs.length; i++) {
            this.idxdbs[i].storeEx(value.getPrimaryValue(), value.getSecondaryValue(i), payer.N);
        }
        return new PrimaryIterator(it);
    }

    update(it: PrimaryIterator, value: T, payer: Name): void {
        this.db.update(it.i, payer.N, value.pack());
        let primary = value.getPrimaryValue()
        for (let i=0; i<this.idxdbs.length; i++) {
            let ret = this.idxdbs[i].findPrimaryEx(primary);
            let newValue = value.getSecondaryValue(i);
            if (ret.value.type == newValue.type && ret.value.value == newValue.value) {
                continue;
            }
            this.idxdbs[i].updateEx(ret.i, value.getSecondaryValue(i), payer.N);
        }
    }

    remove(iterator: PrimaryIterator): void {
        let value = this.get(iterator);
        let primary = value.getPrimaryValue();
        this.removeEx(primary);
    }

    removeEx(primary: u64): void {
        let it = this.find(primary);
        assert(it.isOk(), "primary value not found!");
        this.db.remove(it.i);
        for (let i=0; i<this.idxdbs.length; i++) {
            let ret = this.idxdbs[i].findPrimaryEx(primary);
            assert(ret.i.isOk(), "secondary value not found!");
            this.idxdbs[i].remove(ret.i);
        }
    }

    get(iterator: PrimaryIterator): T {
        let data = this.db.get(iterator.i);
        let ret = this.newObj();
        ret.unpack(data);
        return ret;
    }

    next(iterator: PrimaryIterator): PrimaryIterator {
        let i = this.db.next(iterator.i);
        return new PrimaryIterator(i);
    }

    previous(iterator: PrimaryIterator): PrimaryIterator {
        let i = this.db.previous(iterator.i);
        return new PrimaryIterator(i);
    }

    find(id: u64): PrimaryIterator {
        let i = this.db.find(id);
        return new PrimaryIterator(i);
    }

    lowerBound(id: u64): PrimaryIterator {
        let i = this.db.lowerBound(id);
        return new PrimaryIterator(i);
    }

    upperBound(id: u64): PrimaryIterator {
        let i = this.db.upperBound(id);
        return new PrimaryIterator(i);
    }

    end(): PrimaryIterator {
        let i = this.db.end();
        return new PrimaryIterator(i);
    }

    getIdxDB(i: i32): IDXDB {
        if (i >= this.idxdbs.length) {
            assert(false, "getIdxDB: bad db index");
        }
        return this.idxdbs[i];
    }

    idxUpdate(it: SecondaryIterator, idxValue: SecondaryValue, payer: Name): void {
        let primaryIt = this.find(it.primary);
        let value = this.get(primaryIt);
        value.setSecondaryValue(it.dbIndex, idxValue);
        this.update(primaryIt, value, payer);
        this.idxdbs[it.dbIndex].updateEx(it, idxValue, payer.N);
    }
}
