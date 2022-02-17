import { U128, U256 } from "./bignum"

export class SecondaryIterator {
    i: i32;
    primary: u64;
    dbIndex: u32;
    constructor(i: i32, primary: u64, dbIndex: u32) {
        this.i = i;
        this.primary = primary;
        this.dbIndex = dbIndex;
    }

    isOk(): bool {
        return this.i >= 0;
    }

    isEnd(): bool {
        return this.i == -2;
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
    return new SecondaryValue(SecondaryType.F64, arr);
}

export function newSecondaryValue_u64(value: u64): SecondaryValue {
    let arr = new Array<u64>(1);
    arr[0] = value;
    return new SecondaryValue(SecondaryType.U64, arr);
}

export function newSecondaryValue_U128(value: U128): SecondaryValue {
    let arr = new Array<u64>(2);
    let buffer = changetype<ArrayBufferView>(arr).dataStart;
    store<u64>(buffer, value.lo);
    store<u64>(buffer + 8, value.hi);
    return new SecondaryValue(SecondaryType.U128, arr);
}

export function newSecondaryValue_f64(value: f64): SecondaryValue {
    let arr = new Array<u64>(1);
    store<f64>(arr.dataStart, value);
    return new SecondaryValue(SecondaryType.F64, arr);
}

export function getSecondaryValue_u64(value: SecondaryValue): u64 {
    return value.value[0];
}

export function getSecondaryValue_U128(value: SecondaryValue): U128 {
    return new U128(value.value[0], value.value[1]);
}

export function getSecondaryValue_f64(value: SecondaryValue): f64 {
    return load<f64>(value.value.dataStart);
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
    abstract findPrimaryEx(primary: u64): SecondaryReturnValue;
}
