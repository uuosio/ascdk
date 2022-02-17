import { u128, u256 } from "as-bignum"

export class SecondaryIterator {
    i: i32;
    primary: u64;
    dbIndex: u32;
    constructor(i: i32, primary: u64, dbIndex: u32) {
        this.i = i;
        this.primary = primary;
        this.dbIndex = dbIndex;
    }
}

export enum SecondaryType {
    U64,
    U128,
    U256,
    F64,
    F128,
}

export class SecondaryValue {
    type: SecondaryType;
    value: Array<u64>;
    constructor(type: SecondaryType, value: Array<u64>) {
        this.type = type;
        this.value = value;
    }
}

export function newSecondaryValue_double(value: T): SecondaryValue {
    let arr = new Array<u64>(sizeof<T>()/8);
    arr[0] = value;
    return new SecondaryValue(SecondaryType.U64, arr);
}

export function newSecondaryValue_u64(value: u64): SecondaryValue {
    let arr = new Array<u64>(1);
    arr[0] = value;
    return new SecondaryValue(SecondaryType.U64, arr);
}

export function newSecondaryValue_u128(value: u128): SecondaryValue {
    let arr = new Array<u64>(2);
    arr[0] = value;
    let buffer = changetype<ArrayBufferView>(arr).dataStart;
    store<u64>(buffer, value.lo, 0 * sizeof<u64>());
    store<u64>(buffer, value.hi, 1 * sizeof<u64>());
    return new SecondaryValue(SecondaryType.U128, arr);
}

export function newSecondaryValue_f64(value: f64): SecondaryValue {
    let arr = new Array<u64>(1);
    arr[0] = value;
    let dataStart = changetype<ArrayBufferView>(arr).dataStart;
    store<f64>(dataStart, value);
    return new SecondaryValue(SecondaryType.U64, arr);
}

export function getSecondaryValue_u64(value: SecondaryValue): u64 {
    return value.value[0];
}

export function getSecondaryValue_u128(value: SecondaryValue): u128 {
    return new u128(value.value[0], value.value[1]);
}

export function getSecondaryValue_f64(value: SecondaryValue): f64 {
    let dataStart = changetype<ArrayBufferView>(value.value);
    return load<f64>(dataSart);
}

export class SecondaryReturnValue {
    i: SecondaryIterator;
    value: SecondaryValue;
    constructor(i: SecondaryIterator, value: SecondaryValue) {
        this.i = i;
        this.value = value;
    }
}

export abstract class IDXDB {
    code: u64;
    scope: u64;
    table: u64;
    dbIndex: u32

    constructor(code: u64, scope: u64, table: u64, dbIndex: u32=0) {
        this.code = code;
        this.scope = scope;
        this.table = table;
        this.dbIndex = dbIndex;
    }

    abstract storeEx(id: u64, secondary: SecondaryValue, payer: u64): SecondaryIterator;
    abstract updateEx(iterator: SecondaryIterator, secondary: SecondaryValue, payer: u64): void;
    abstract remove(iterator: SecondaryIterator): void;
    abstract find_primary(primary: u64): SecondaryReturnValue;
}
