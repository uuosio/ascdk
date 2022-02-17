import { IDXDB, SecondaryType, SecondaryValue, SecondaryIterator } from "./idxdb"
import { DBI64, PrimaryValue } from "./dbi64"
import { IDX64 } from "./idx64"
import { Name } from "./name"
import { printString } from "./debug"

export class PrimaryIterator {
    i: i32;
    constructor(iterator: i32) {
        this.i = iterator;
    }

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
                let idxTable = (table.N&0xfffffffffffffff0) + i;
                this.idxdbs[i] = new IDX64(code.N, scope.N, idxTable, i);
            }
        }
    }

    store(value: T, payer: Name): PrimaryIterator {
        let it = this.db.store(value.getPrimaryValue(), value.serialize(), payer.N);
        for (let i=0; i<this.idxdbs.length; i++) {
            this.idxdbs[i].storeEx(value.getPrimaryValue(), value.getSecondaryValue(i), payer.N);
        }
        return new PrimaryIterator(it);
    }

    update(it: PrimaryIterator, value: T, payer: Name): void {
        this.db.update(it.i, payer.N, value.serialize());
        let primary = value.getPrimaryValue()
        for (let i=0; i<this.idxdbs.length; i++) {
            let ret = this.idxdbs[i].find_primary(primary);
            let newValue = value.getSecondaryValue(i);
            if (ret.value.type == newValue.type && ret.value.value == newValue.value) {
                continue;
            }
            this.idxdbs[i].updateEx(ret.i, value.getSecondaryValue(i), payer.N);
        }
    }

    remove(iterator: PrimaryIterator): void {
        this.db.remove(iterator.i);
    }

    get(iterator: PrimaryIterator): T {
        let data = this.db.get(iterator.i);
        let ret = this.newObj();
        ret.deserialize(data);
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

    get_idx_db(i: i32): IDXDB {
        return this.idxdbs[i];
    }

    idx_update(it: SecondaryIterator, idxValue: SecondaryValue, payer: Name): void {
        let primaryIt = this.find(it.primary);
        let value = this.get(primaryIt);
        value.setSecondaryValue(it.dbIndex, idxValue);
        this.update(primaryIt, value, payer);
        this.idxdbs[it.dbIndex].update(it, idxValue, payer);
    }
}
