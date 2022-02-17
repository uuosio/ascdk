import {IDXDB, SecondaryValue, SecondaryType, SecondaryIterator, SecondaryReturnValue} from "./idxdb"
import * as env from "./env"
import {assert} from "./system"
import { printString } from "./debug"
import { PrimaryIterator } from "./mi"

class IDX64ReturnValue {
    i: SecondaryIterator;
    value: u64; //secondary value
    constructor(i: SecondaryIterator, value: u64) {
        this.i = i;
        this.value = value;
    }
}

export class IDX64 extends IDXDB {
    store(id: u64, value: u64, payer: u64): SecondaryIterator {
        let secondary_ptr = __alloc(sizeof<u64>());
        store<u64>(secondary_ptr, value);
        let it = env.db_idx64_store(this.scope, this.table, payer, id, secondary_ptr);
        return new SecondaryIterator(it, id, this.dbIndex);
    }
    
    update(iterator: SecondaryIterator, value: u64, payer: u64): void {
        let value_ptr = __alloc(sizeof<u64>());
        store<u64>(value_ptr, value);
        env.db_idx64_update(iterator.i, payer, value_ptr);
    }

    storeEx(id: u64, value: SecondaryValue, payer: u64): SecondaryIterator {
        assert(value.type == SecondaryType.U64, "idx64: bad type");
        return this.store(id, value.value[0], payer);
    }

    updateEx(iterator: SecondaryIterator, secondary: SecondaryValue, payer: u64): void {
        assert(secondary.type == SecondaryType.U64, "idx64: bad value");
        this.update(iterator, secondary.value[0], payer);
    }

    remove(iterator: SecondaryIterator): void {
        env.db_idx64_remove(iterator.i);
    }

    next(iterator: SecondaryIterator): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_next(iterator.i, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    previous(iterator: SecondaryIterator): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_previous(iterator.i, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    findPrimary(primary: u64): IDX64ReturnValue {
        let secondary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_find_primary(this.code, this.scope, this.table, secondary_ptr, primary);
        let i = new SecondaryIterator(it, primary, this.dbIndex)
        return new IDX64ReturnValue(i, load<u64>(secondary_ptr));
    }

    findPrimaryEx(primary: u64): SecondaryReturnValue {
        let secondary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_find_primary(this.code, this.scope, this.table, secondary_ptr, primary);
        let i = new SecondaryIterator(it, primary, this.dbIndex)
        let value = new Array<u64>(1);
        value[0] = load<u64>(secondary_ptr);
        let secondary = new SecondaryValue(SecondaryType.U64, value);
        return new SecondaryReturnValue(i, secondary);
    }

    find(secondary: u64): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = __alloc(sizeof<u64>());
        store<u64>(secondary_ptr, secondary);
        let it = env.db_idx64_find_secondary(this.code, this.scope, this.table, secondary_ptr, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    lowerBound(secondary: u64): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = __alloc(sizeof<u64>());
        store<u64>(secondary_ptr, secondary);
        let it = env.db_idx64_lowerbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    lowerBoundEx(secondary: u64): IDX64ReturnValue {
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = __alloc(sizeof<u64>());
        store<u64>(secondary_ptr, secondary);
        let it = env.db_idx64_lowerbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        return new IDX64ReturnValue(iterator, load<u64>(secondary_ptr));
    }

    upperBound(secondary: u64): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = __alloc(sizeof<u64>());
        store<u64>(secondary_ptr, secondary);
        let it = env.db_idx64_upperbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    upperBoundEx(secondary: u64): IDX64ReturnValue {
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = __alloc(sizeof<u64>());
        store<u64>(secondary_ptr, secondary);
        let it = env.db_idx64_upperbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        return new IDX64ReturnValue(iterator, load<u64>(secondary_ptr));
    }

    end(): SecondaryIterator {
        let it = env.db_idx64_end(this.code, this.scope, this.table);
        return new SecondaryIterator(it, 0, this.dbIndex);
    }
}

//store
//update

// func (db *IdxDB64I) Find(secondary uint64) SecondaryIterator
// func (db *IdxDB64I) Lowerbound(secondary uint64) (SecondaryIterator, uint64)
// func (db *IdxDB64I) Upperbound(secondary uint64) (SecondaryIterator, uint64)

// func (db *IdxDB64I) FindByPrimary(primary uint64) (SecondaryIterator, uint64)
