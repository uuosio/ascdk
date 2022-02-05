import * as env from "./env"

export declare function eosio_assert_message(test: u32, msg_ptr: usize, msg_len: usize): void;

export function assert(test: bool, msg: string): void {
    let s1 = String.UTF8.encode(msg);
    let dv = new DataView(s1);
    let _test = test ? 1 : 0;
    env.eosio_assert_message(_test, dv.dataStart, msg.length);
}

export function check(test: bool, msg: string): void {
    assert(test, msg);
}
