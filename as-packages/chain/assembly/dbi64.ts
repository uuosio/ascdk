import * as env from "./env"
import {printString} from "./debug"
import {Packer} from "./serializer"

export function say_hello(): void {
    printString("hello,world from dbi64")
//    env.db_remove_i64(-1 as i32);
}

export interface PrimaryValue extends Packer {
    getPrimaryValue(): u64;
}

export class DBI64 {
    constructor(
        public code: u64,
        public scope: u64,
        public table: u64) {
    }

    store(id: u64, data: u8[], payer: u64): i32 {
        let data_ptr = data.dataStart;
        return env.db_store_i64(this.scope, this.table, payer, id, data_ptr, data.length );
    }

    // export declare function db_update_i64(iterator: i32, payer: u64, data: usize, len: usize): void
    update(iterator: i32, payer: u64, data: u8[]): void {
        let data_ptr = data.dataStart;
        env.db_update_i64(iterator, payer, data_ptr, data.length);
    }

    // export declare function db_remove_i64(iterator: i32): void
    remove(iterator: i32): void {
        env.db_remove_i64(iterator);
    }

    // export declare function db_get_i64(iterator: i32, data: usize, len: usize): i32
    get(iterator: i32): u8[] {
        let size = env.db_get_i64(iterator, 0, 0);
        if (size == 0) {
            return [];
        }
        let arr = new Array<u8>(size);
        let ptr = arr.dataStart;
        env.db_get_i64(iterator, ptr, size);
        return arr
    }

    // export declare function db_next_i64(iterator: i32, primary_ptr: usize): i32
    next(iterator: i32): i32 {
        let primary_ptr = __alloc(sizeof<u64>());
        let itNext = env.db_next_i64(iterator, primary_ptr)
        return itNext
    }

    // export declare function db_previous_i64(iterator: i32, primary_ptr: usize): i32
    previous(iterator: i32): i32 {
        let primary_ptr = __alloc(sizeof<u64>());
        let itNext = env.db_previous_i64(iterator, primary_ptr)
        return itNext
    }

    // export declare function db_find_i64(code: u64, scope: u64, table: u64, id: u64): i32
    find(id: u64): i32 {
        return env.db_find_i64(this.code, this.scope, this.table, id);
    }

    // export declare function db_lowerbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
    lowerBound(id: u64): i32 {
        return env.db_lowerbound_i64(this.code, this.scope, this.table, id);
    }

    // export declare function db_upperbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
    upperBound(id: u64): i32 {
        return env.db_upperbound_i64(this.code, this.scope, this.table, id);
    }

    // export declare function db_end_i64(code: u64, scope: u64, table: u64): i32
    end(): i32 {
        return env.db_end_i64(this.code, this.scope, this.table);
    }
}

