import {IDXDB, SecondaryValue, SecondaryType, SecondaryIterator, SecondaryReturnValue} from "./idxdb"
import * as env from "./env"
import {assert} from "./system"

export class IDXF64 extends IDXDB {
    store(id: u64, value: SecondaryValue, payer: u64): SecondaryIterator {
        assert(value.type == SecondaryType.F64, "idx_double: bad type")
        let it = env.db_idx_double_store(this.scope, this.table, payer, id, value.value[0])
        return new SecondaryIterator(it, id, this.dbIndex);
    }
    
    update(iterator: i32, secondary: SecondaryValue, payer: u64): void {
        assert(secondary.type == SecondaryType.F64, "idx_double: bad value");
        assert(secondary.value.length == 1, "idx_double: bad value");
        env.db_idx_double_update(iterator, payer, secondary.value[0]);
    }

    remove(iterator: i32): void {
        env.db_idx_double_remove(iterator);
    }

    next(iterator: i32): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx_double_next(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    previous(iterator: i32): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx_double_previous(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    findPrimary(primary: u64): SecondaryReturnValue {
        let secondary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx_double_find_primary(this.code, this.scope, this.table, secondary_ptr, primary);
        let i = new SecondaryIterator(it, primary, this.dbIndex)
        let value = new Array<u64>(1);
        value[0] = load<u64>(secondary_ptr);
        let secondary = new SecondaryValue(SecondaryType.F64, value);
        return new SecondaryReturnValue(i, secondary);
    }

    find(secondary: SecondaryValue): SecondaryIterator {
        assert(secondary.type == SecondaryType.F64, "idx_double: bad secondary type");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = secondary.value.dataStart;
        let it = env.db_idx_double_find_secondary(this.code, this.scope, this.table, secondary_ptr, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    lowerbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.F64, "idx_double: bad secondary type");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondaryCopy = new Array<u64>(1);
        secondaryCopy[0] = secondary.value[0];
        let secondary_ptr = secondaryCopy.dataStart;
        let it = env.db_idx_double_lowerbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        let value = new SecondaryValue(SecondaryType.F64, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    upperbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.F64, "idx_double: bad secondary type");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondaryCopy = new Array<u64>(1);
        secondaryCopy[0] = secondary.value[0];
        let secondary_ptr = secondaryCopy.dataStart;
        let it = env.db_idx_double_upperbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        let value = new SecondaryValue(SecondaryType.F64, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    end(): SecondaryIterator {
        let it = env.db_idx_double_end(this.code, this.scope, this.table);
        return new SecondaryIterator(it, 0, this.dbIndex);
    }
}

