import * as env from "./env";
import { printString } from "./debug";
import { Packer } from "./serializer";
import { check } from "./system";

export function say_hello(): void {
    printString("hello,world from dbi64");
}

export interface PrimaryValue extends Packer {
    getPrimaryValue(): u64;
}

export class PrimaryIterator<T extends PrimaryValue> {
    db: DBI64<T>;
    i: i32;
    validPrimary: bool

    _primary: u64;
    constructor(
        db: DBI64<T>,
        i: i32,
        primary: u64,
        validPrimary: bool
    ) {
        this.db = db;
        this.i = i;
        this._primary = primary;
        this.validPrimary = validPrimary
    }

    get primary(): u64 {
        check(this.isOk(), "get primary: invalid iterator");

        if (this.validPrimary) {
            return this._primary;
        }

        let value = this.getValue();
        this._primary = value!.getPrimaryValue();
        this.validPrimary = true;
        return this._primary;
    }

    getValue(): T | null {
        if (!this.isOk()) {
            return null;
        }
        return this.db.getEx(this.i)
    }

    isOk(): bool {
        return this.i >= 0;
    }

    isEnd(): bool {
        return this.i <= -2;
    }
}

export class DBI64<T extends PrimaryValue> {
    constructor(
        public code: u64,
        public scope: u64,
        public table: u64) {
    }

    store(id: u64, value: T, payer: u64): PrimaryIterator<T> {
        let data = value.pack();
        let data_ptr = data.dataStart;
        let i = env.db_store_i64(this.scope, this.table, payer, id, data_ptr, data.length );
        return new PrimaryIterator<T>(this, i, id, true);
    }

    // export declare function db_update_i64(iterator: i32, payer: u64, data: usize, len: usize): void
    update(iterator: PrimaryIterator<T>, payer: u64, value: T): void {
        let data = value.pack();
        let data_ptr = data.dataStart;
        env.db_update_i64(iterator.i, payer, data_ptr, data.length);
    }

    // export declare function db_remove_i64(iterator: i32): void
    remove(iterator: PrimaryIterator<T>): void {
        env.db_remove_i64(iterator.i);
    }

    // export declare function db_get_i64(iterator: i32, data: usize, len: usize): i32
    get(iterator: PrimaryIterator<T>): T | null {
        if (!iterator.isOk()) {
            return null;
        }
        return this.getEx(iterator.i);
    }

    getEx(iterator: i32): T | null {
        let size = env.db_get_i64(iterator, 0, 0);
        if (size == 0) {
            return null;
        }
        let arr = new Array<u8>(size);
        let ptr = arr.dataStart;
        env.db_get_i64(iterator, ptr, size);
        let ret = instantiate<T>();
        ret.unpack(arr);
        return ret;
    }

    // export declare function db_next_i64(iterator: i32, primary_ptr: usize): i32
    next(iterator: PrimaryIterator<T>): PrimaryIterator<T> {
        let primary_ptr = __alloc(sizeof<u64>());
        let itNext = env.db_next_i64(iterator.i, primary_ptr);
        return new PrimaryIterator(this, itNext, load<u64>(primary_ptr), true);
    }

    // export declare function db_previous_i64(iterator: i32, primary_ptr: usize): i32
    previous(iterator: PrimaryIterator<T>): PrimaryIterator<T> {
        let primary_ptr = __alloc(sizeof<u64>());
        let itNext = env.db_previous_i64(iterator.i, primary_ptr);
        return new PrimaryIterator(this, itNext, load<u64>(primary_ptr), true);
    }

    // export declare function db_find_i64(code: u64, scope: u64, table: u64, id: u64): i32
    find(id: u64): PrimaryIterator<T> {
        let i = env.db_find_i64(this.code, this.scope, this.table, id);
        if (i >= 0) {
            return new PrimaryIterator(this, i, id, true);
        }
        return new PrimaryIterator(this, i, 0, false);
    }

    // export declare function db_lowerbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
    lowerBound(id: u64): PrimaryIterator<T> {
        let i = env.db_lowerbound_i64(this.code, this.scope, this.table, id);
        return new PrimaryIterator(this, i, 0, false);
    }

    // export declare function db_upperbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
    upperBound(id: u64): PrimaryIterator<T> {
        let i = env.db_upperbound_i64(this.code, this.scope, this.table, id);
        return new PrimaryIterator(this, i, 0, false);
    }

    // export declare function db_end_i64(code: u64, scope: u64, table: u64): i32
    end(): PrimaryIterator<T> {
        let i = env.db_end_i64(this.code, this.scope, this.table);
        return new PrimaryIterator(this, i, 0, false);
    }
}

