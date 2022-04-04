import * as env from "./env";
import {printString} from "./debug";
import {Packer} from "./serializer";

export function say_hello(): void {
    printString("hello,world from dbi64");
}

export interface PrimaryValue extends Packer {
    getPrimaryValue(): u64;
}

export const UNKNOWN_PRIMARY_KEY: u64 = 0xffffffffffffffff

export class PrimaryIterator<T extends PrimaryValue> {
    db: DBI64<T>;
    i: i32;

    _value: T | null;
    _primary: u64;
    constructor(
        db: DBI64<T>,
        i: i32,
        _primary: u64,
    ) {
        this.db = db;
        this.i = i;
        this._value = null;
        this._primary = _primary;
    }

    get primary(): u64 {
        if (!this.isOk()) {
            return 0;
        }

        if (this._primary != UNKNOWN_PRIMARY_KEY) {
            return this._primary;
        }

        let value = this.value;
        this._primary = value!.getPrimaryValue();
        return this._primary;
    }

    get value(): T | null {
        if (this._value) {
            return this._value;
        }

        if (!this.isOk()) {
            return null;
        }
        this._value = this.db.getEx(this.i)
        return this._value;
    }

    isOk(): bool {
        return this.i >= 0;
    }

    isEnd(): bool {
        return this.i == -2;
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
        return new PrimaryIterator<T>(this, i, id);
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
        return iterator.value;
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
        return new PrimaryIterator(this, itNext, load<u64>(primary_ptr));
    }

    // export declare function db_previous_i64(iterator: i32, primary_ptr: usize): i32
    previous(iterator: PrimaryIterator<T>): PrimaryIterator<T> {
        let primary_ptr = __alloc(sizeof<u64>());
        let itNext = env.db_previous_i64(iterator.i, primary_ptr);
        return new PrimaryIterator(this, itNext, load<u64>(primary_ptr));
    }

    // export declare function db_find_i64(code: u64, scope: u64, table: u64, id: u64): i32
    find(id: u64): PrimaryIterator<T> {
        let i = env.db_find_i64(this.code, this.scope, this.table, id);
        if (i >= 0) {
            return new PrimaryIterator(this, i, id);
        }
        return new PrimaryIterator(this, i, id);
    }

    // export declare function db_lowerbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
    lowerBound(id: u64): PrimaryIterator<T> {
        let i = env.db_lowerbound_i64(this.code, this.scope, this.table, id);
        return new PrimaryIterator(this, i, UNKNOWN_PRIMARY_KEY);
    }

    // export declare function db_upperbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
    upperBound(id: u64): PrimaryIterator<T> {
        let i = env.db_upperbound_i64(this.code, this.scope, this.table, id);
        return new PrimaryIterator(this, i, UNKNOWN_PRIMARY_KEY);
    }

    // export declare function db_end_i64(code: u64, scope: u64, table: u64): i32
    end(): PrimaryIterator<T> {
        let i = env.db_end_i64(this.code, this.scope, this.table);
        return new PrimaryIterator(this, i, UNKNOWN_PRIMARY_KEY);
    }
}

