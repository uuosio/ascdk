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

    abstract store(id: u64, secondary: SecondaryValue, payer: u64): SecondaryIterator;
    abstract update(iterator: i32, secondary: SecondaryValue, payer: u64): void;
    abstract remove(iterator: i32): void;

    abstract next(iterator: i32): SecondaryIterator;
    abstract previous(iterator: i32): SecondaryIterator;
    abstract find_primary(primary: u64): SecondaryReturnValue;
    abstract find(secondary: SecondaryValue): SecondaryIterator;
    abstract lowerbound(secondary: SecondaryValue): SecondaryReturnValue;
    abstract upperbound(secondary: SecondaryValue): SecondaryReturnValue;
    abstract end(): SecondaryIterator;
}
