import {IDXDB, SecondaryValue, SecondaryType, SecondaryIterator, SecondaryReturnValue} from "./idxdb"
import * as env from "./env"
import {assert} from "./system"

export class IDX64 extends IDXDB {
    store(id: u64, value: SecondaryValue, payer: u64): SecondaryIterator {
        assert(value.type == SecondaryType.U64, "idx64: bad type")
        let it = env.db_idx64_store(this.scope, this.table, payer, id, value.value[0])
        return new SecondaryIterator(it, id, this.dbIndex);
    }
    
    update(iterator: i32, secondary: SecondaryValue, payer: u64): void {
        assert(secondary.type == SecondaryType.U64, "idx64: bad value");
        assert(secondary.value.length == 1, "idx64: bad value");
        env.db_idx64_update(iterator, payer, secondary.value[0]);
    }

    remove(iterator: i32): void {
        env.db_idx64_remove(iterator);
    }

    next(iterator: i32): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_next(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    previous(iterator: i32): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_previous(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    find_primary(primary: u64): SecondaryReturnValue {
        let secondary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx64_find_primary(this.code, this.scope, this.table, secondary_ptr, primary);
        let i = new SecondaryIterator(it, primary, this.dbIndex)
        let value = new Array<u64>(1);
        value[0] = load<u64>(secondary_ptr);
        let secondary = new SecondaryValue(SecondaryType.U64, value);
        return new SecondaryReturnValue(i, secondary);
    }

    find(secondary: SecondaryValue): SecondaryIterator {
        assert(secondary.type == SecondaryType.U64, "idx64: bad secondary type");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = changetype<ArrayBufferView>(secondary.value).dataStart;
        let it = env.db_idx64_find_secondary(this.code, this.scope, this.table, secondary_ptr, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    lowerbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.U64, "idx64: bad secondary type");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondaryCopy = new Array<u64>(1);
        secondaryCopy[0] = secondary.value[0];
        let secondary_ptr = changetype<ArrayBufferView>(secondaryCopy).dataStart;
        let it = env.db_idx64_lowerbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        let value = new SecondaryValue(SecondaryType.U64, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    upperbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.U64, "idx64: bad secondary type");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondaryCopy = new Array<u64>(1);
        secondaryCopy[0] = secondary.value[0];
        let secondary_ptr = changetype<ArrayBufferView>(secondaryCopy).dataStart;
        let it = env.db_idx64_upperbound(this.code, this.scope, this.table, secondary_ptr, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        let value = new SecondaryValue(SecondaryType.U64, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    end(): SecondaryIterator {
        let it = env.db_idx64_end(this.code, this.scope, this.table);
        return new SecondaryIterator(it, 0, this.dbIndex);
    }
}
