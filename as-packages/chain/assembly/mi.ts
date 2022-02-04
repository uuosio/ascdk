import {IDXDB, SecondaryType, SecondaryValue} from "./idxdb"
import {DBI64, PrimaryValue, Iterator} from "./dbi64"
import {IDX64} from "./idx64"

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
    constructor(code: u64, scope: u64, table: u64, indexes: Array<SecondaryType>) {
        this.db = new DBI64(code, scope, table);
        this.idxdbs = new Array<IDXDB>(indexes.length);
        if (indexes) {
            for (let i=0; i<indexes.length; i++) {
                let idxTable = (code&0xfffffffffffffff0) + i;
                this.idxdbs[i] = new IDX64(code, scope, idxTable, i);
            }
        }
    }

    store(value: T, payer: u64): Iterator {
        let it = this.db.store(value.getPrimaryValue(), value.pack(), payer);
        for (let i=0; i<this.idxdbs.length; i++) {
            this.idxdbs[i].store(value.getPrimaryValue(), value.getSecondaryValue(i), payer)
        }
        return new Iterator(it);
    }

    update(it: Iterator, v: T, payer: u64): void {
        let value = new T();
        let data = this.db.get(it.i)
        value.unpack(data)
        for (let i=0; i<this.idxdbs.length; i++) {
            this.idxdbs[i].update(it, value.getPrimaryValue(), value.getSecondaryValue(i), payer)
        }
    }
}
