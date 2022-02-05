export declare function memcpy (destination: usize, source: usize, num: usize): usize;

export declare function printi(n: i64): void
export declare function printui(n: u64): void
export declare function prints(n: usize): void
export declare function prints_l(cstr: usize, len: usize): void

export declare function printhex(ptr: usize, len: usize): void
export declare function read_action_data(ptr: usize, len: u32): usize
export declare function action_data_size(): u32

export declare function send_inline(serialized_action: usize, size: u32): void;

// void  eosio_assert_message( uint32_t test, const char* msg, uint32_t msg_len );
export declare function eosio_assert_message(test: u32, msg_ptr: usize, msg_len: usize): void;

export declare function db_store_i64(scope: u64, table: u64, payer: u64, id: u64,  data: usize, len: usize): i32
export declare function db_update_i64(iterator: i32, payer: u64, data: usize, len: usize): void
export declare function db_remove_i64(iterator: i32): void
export declare function db_get_i64(iterator: i32, data: usize, len: usize): i32
export declare function db_next_i64(iterator: i32, primary_ptr: usize): i32
export declare function db_previous_i64(iterator: i32, primary_ptr: usize): i32
export declare function db_find_i64(code: u64, scope: u64, table: u64, id: u64): i32
export declare function db_lowerbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
export declare function db_upperbound_i64(code: u64, scope: u64, table: u64, id: u64): i32
export declare function db_end_i64(code: u64, scope: u64, table: u64): i32


export declare function db_idx64_store(scope: u64, table: u64, payer: u64, id: u64, secondary: u64): i32;
export declare function db_idx64_update(iterator: i32, payer: u64, secondary: u64): void;
export declare function db_idx64_remove(iterator: i32): void;
export declare function db_idx64_next(iterator: i32, primary_ptr: usize): i32;
export declare function db_idx64_previous(iterator: i32, primary_ptr: usize): i32;
export declare function db_idx64_find_primary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary: u64): i32;
export declare function db_idx64_find_secondary(code: u64, scope: u64, table: u64, secondary: u64, primary_ptr: usize): i32;
export declare function db_idx64_lowerbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32;
export declare function db_idx64_upperbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32;
export declare function db_idx64_end(code: u64, scope: u64, table: u64): i32;


export declare function db_idx128_store(scope: u64, table: u64, payer: u64, id: u64, secondary_ptr: usize): i32
export declare function db_idx128_update(iterator: i32, payer: u64, secondary_ptr: usize): void;
export declare function db_idx128_remove(iterator: i32): void;
export declare function db_idx128_next(iterator: i32, primary_ptr: usize): i32
export declare function db_idx128_previous(iterator: i32, primary_ptr: usize): i32
export declare function db_idx128_find_primary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary: u64): i32
export declare function db_idx128_find_secondary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32
export declare function db_idx128_lowerbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32
export declare function db_idx128_upperbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32
export declare function db_idx128_end(code: u64, scope: u64, table: u64): i32

export declare function db_idx_double_store(scope: u64, table: u64, payer: u64, id: u64, secondary_ptr: usize): i32
export declare function db_idx_double_update(iterator: i32, payer: u64, secondary_ptr: usize): void
export declare function db_idx_double_remove(iterator: i32): void
export declare function db_idx_double_next(iterator: i32, primary_ptr: usize): i32
export declare function db_idx_double_previous(iterator: i32, primary_ptr: usize): i32
export declare function db_idx_double_find_primary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary: u64): i32
export declare function db_idx_double_find_secondary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32
export declare function db_idx_double_lowerbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32
export declare function db_idx_double_upperbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: usize): i32
export declare function db_idx_double_end(code: u64, scope: u64, table: u64): i32

export declare function db_idx_long_double_store(scope: u64, table: u64, payer: u64, id: u64, secondary_ptr: usize): i32
export declare function db_idx_long_double_update(iterator: i32, payer: u64, secondary_ptr: usize): void
export declare function db_idx_long_double_remove(iterator: i32): void
export declare function db_idx_long_double_next(iterator: i32, primary_ptr: u64): i32
export declare function db_idx_long_double_previous(iterator: i32, primary_ptr: u64): i32
export declare function db_idx_long_double_find_primary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary: u64): i32
export declare function db_idx_long_double_find_secondary(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: u64): i32
export declare function db_idx_long_double_lowerbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: u64): i32
export declare function db_idx_long_double_upperbound(code: u64, scope: u64, table: u64, secondary_ptr: usize, primary_ptr: u64): i32
export declare function db_idx_long_double_end(code: u64, scope: u64, table: u64): i32;


export declare function db_idx256_store(scope: u64, table: u64, payer: u64, id: u64, data_ptr: usize, data_len: u32 ): i32
export declare function db_idx256_update(iterator: i32, payer: u64, data_ptr: usize, data_len: u32): void
export declare function db_idx256_remove(iterator: i32): void
export declare function db_idx256_next(iterator: i32, primary_ptr: usize): i32
export declare function db_idx256_previous(iterator: i32, primary_ptr: usize): i32
export declare function db_idx256_find_primary(code: u64, scope: u64, table: u64, data_ptr: usize, data_len: u32, primary: u64): i32
export declare function db_idx256_find_secondary(code: u64, scope: u64, table: u64, data_ptr: usize, data_len: u32, primary_ptr: usize): i32
export declare function db_idx256_lowerbound(code: u64, scope: u64, table: u64, data_ptr: usize, data_len: u32, primary_ptr: usize): i32
export declare function db_idx256_upperbound(code: u64, scope: u64, table: u64, data_ptr: usize, data_len: u32, primary_ptr: usize): i32
export declare function db_idx256_end(code: u64, scope: u64, table: u64): i32

