import {IDXDB, SecondaryValue, SecondaryType, SecondaryIterator, SecondaryReturnValue} from "./idxdb"
import * as env from "./env"
import {assert} from "./system"

export class IDXF128 extends IDXDB {
    store(id: u64, value: SecondaryValue, payer: u64): SecondaryIterator {
        assert(value.type == SecondaryType.U128, "idx_long_double: bad type")
        assert(value.value.length == 2, "idx_long_double: bad value");
        let secondary_ptr = changetype<ArrayBufferView>(value).dataStart;
        let it = env.db_idx_long_double_store(this.scope, this.table, payer, id, secondary_ptr);
        return new SecondaryIterator(it, id, this.dbIndex);
    }
    
    update(iterator: i32, secondary: SecondaryValue, payer: u64): void {
        assert(secondary.type == SecondaryType.U128, "idx_long_double: bad value");
        assert(secondary.value.length == 2, "idx_long_double: bad value");
        let secondary_ptr = changetype<ArrayBufferView>(secondary).dataStart;
        env.db_idx_long_double_update(iterator, payer, secondary_ptr);
    }

    remove(iterator: i32): void {
        env.db_idx_long_double_remove(iterator);
    }

    next(iterator: i32): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx_long_double_next(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    previous(iterator: i32): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx_long_double_previous(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    find_primary(primary: u64): SecondaryReturnValue {
        let secondary_ptr = __alloc(sizeof<u64>()*2);
        let it = env.db_idx_long_double_find_primary(this.code, this.scope, this.table, secondary_ptr, primary);
        let i = new SecondaryIterator(it, primary, this.dbIndex);
        let value = new Array<u64>(2);
        value[0] = load<u64>(secondary_ptr);
        value[1] = load<u64>(secondary_ptr+8);
        let secondary = new SecondaryValue(SecondaryType.U128, value);
        return new SecondaryReturnValue(i, secondary);
    }

    find(secondary: SecondaryValue): SecondaryIterator {
        assert(secondary.type == SecondaryType.U128, "idx_long_double: bad secondary type");
        assert(secondary.value.length == 2, "idx_long_double: bad value");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = changetype<ArrayBufferView>(secondary.value).dataStart;
        let it = env.db_idx_long_double_find_secondary(this.code, this.scope, this.table, secondary_ptr, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    lowerbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.U128, "idx_long_double: bad secondary type");
        assert(secondary.value.length == 2, "idx_long_double: bad value");
        let primary_ptr = __alloc(sizeof<u64>());

        let secondaryCopy = new Array<u64>(2);
        secondaryCopy[0] = secondary.value[0];
        secondaryCopy[1] = secondary.value[1];
        let secondary_ptr = changetype<ArrayBufferView>(secondaryCopy).dataStart;

        let it = env.db_idx_long_double_lowerbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        
        let value = new SecondaryValue(SecondaryType.U128, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    upperbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.U128, "idx_long_double: bad secondary type");
        assert(secondary.value.length == 2, "idx_long_double: bad value");
        let primary_ptr = __alloc(sizeof<u64>());

        let secondaryCopy = new Array<u64>(2);
        secondaryCopy[0] = secondary.value[0];
        secondaryCopy[1] = secondary.value[1];
        let secondary_ptr = changetype<ArrayBufferView>(secondaryCopy).dataStart;
        let it = env.db_idx_long_double_upperbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        let value = new SecondaryValue(SecondaryType.U128, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    end(): SecondaryIterator {
        let it = env.db_idx_long_double_end(this.code, this.scope, this.table);
        return new SecondaryIterator(it, 0, this.dbIndex);
    }
}

