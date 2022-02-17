import {IDXDB, SecondaryValue, SecondaryType, SecondaryIterator, SecondaryReturnValue} from "./idxdb"
import * as env from "./env"
import {assert} from "./system"

export class IDX256 extends IDXDB {
    store(id: u64, value: SecondaryValue, payer: u64): SecondaryIterator {
        assert(value.type == SecondaryType.U256, "idx256: bad type")
        assert(value.value.length == 4, "idx256: bad value");
        let secondary_ptr = value.value.dataStart;
        let it = env.db_idx256_store(this.scope, this.table, payer, id, secondary_ptr, 2);
        return new SecondaryIterator(it, id, this.dbIndex);
    }
    
    update(iterator: i32, secondary: SecondaryValue, payer: u64): void {
        assert(secondary.type == SecondaryType.U256, "idx256: bad value");
        assert(secondary.value.length == 4, "idx256: bad value");
        let secondary_ptr = secondary.value.dataStart;
        env.db_idx256_update(iterator, payer, secondary_ptr, 2);
    }

    remove(iterator: SecondaryIterator): void {
        env.db_idx256_remove(iterator);
    }

    next(iterator: SecondaryIterator): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx256_next(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    previous(iterator: SecondaryIterator): SecondaryIterator {
        let primary_ptr = __alloc(sizeof<u64>());
        let it = env.db_idx256_previous(iterator, primary_ptr);
        let primary = load<u64>(primary_ptr);
        return new SecondaryIterator(it, primary, this.dbIndex);
    }

    findPrimary(primary: u64): SecondaryReturnValue {
        let secondary_ptr = __alloc(sizeof<u64>()*2);
        let it = env.db_idx256_find_primary(this.code, this.scope, this.table, secondary_ptr, 2, primary);
        let i = new SecondaryIterator(it, primary, this.dbIndex);
        let value = new Array<u64>(4);
        value[0] = load<u64>(secondary_ptr);
        value[1] = load<u64>(secondary_ptr+8);
        value[2] = load<u64>(secondary_ptr+16);
        value[3] = load<u64>(secondary_ptr+24);
        let secondary = new SecondaryValue(SecondaryType.U256, value);
        return new SecondaryReturnValue(i, secondary);
    }

    find(secondary: SecondaryValue): SecondaryIterator {
        assert(secondary.type == SecondaryType.U256, "idx256: bad secondary type");
        assert(secondary.value.length == 4, "idx256: bad value");
        let primary_ptr = __alloc(sizeof<u64>());
        let secondary_ptr = secondary.value.dataStart;
        let it = env.db_idx256_find_secondary(this.code, this.scope, this.table, secondary_ptr, 2, primary_ptr);
        return new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
    }

    lowerbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.U256, "idx256: bad secondary type");
        assert(secondary.value.length == 4, "idx256: bad value");
        let primary_ptr = __alloc(sizeof<u64>());

        let secondaryCopy = new Array<u64>(2);
        secondaryCopy[0] = secondary.value[0];
        secondaryCopy[1] = secondary.value[1];
        let secondary_ptr = secondaryCopy.dataStart;

        let it = env.db_idx256_lowerbound(this.code, this.scope, this.table, secondary_ptr, 2, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        
        let value = new SecondaryValue(SecondaryType.U256, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    upperbound(secondary: SecondaryValue): SecondaryReturnValue {
        assert(secondary.type == SecondaryType.U256, "idx256: bad secondary type");
        assert(secondary.value.length == 2, "idx256: bad value");
        let primary_ptr = __alloc(sizeof<u64>());

        let secondaryCopy = new Array<u64>(4);
        secondaryCopy[0] = secondary.value[0];
        secondaryCopy[1] = secondary.value[1];
        secondaryCopy[2] = secondary.value[2];
        secondaryCopy[3] = secondary.value[3];

        let secondary_ptr = secondaryCopy.dataStart;
        let it = env.db_idx256_upperbound(this.code, this.scope, this.table, secondary_ptr, 2, primary_ptr);

        let iterator = new SecondaryIterator(it, load<u64>(primary_ptr), this.dbIndex);
        let value = new SecondaryValue(SecondaryType.U256, secondaryCopy)
        return new SecondaryReturnValue(iterator, value);
    }

    end(): SecondaryIterator {
        let it = env.db_idx256_end(this.code, this.scope, this.table);
        return new SecondaryIterator(it, 0, this.dbIndex);
    }
}

