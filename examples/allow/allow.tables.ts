import { Name, table, primary, Table, MultiIndex, singleton, Singleton } from "as-chain";
import { allowed, paused } from "./allow.constants";

// scope: contract
@table(paused, singleton)
export class PausedSingleton extends Table {
    constructor (
        public isPaused: boolean = true,
    ) {
        super();
    }

    static getSingleton(code: Name): Singleton<Paused> {
        return new Singleton<Paused>(code, code, paused);
    }
}

export class Paused extends PausedSingleton {}

// scope: contract
@table(allowed)
export class AllowedTable extends Table {
    constructor (
        public actor: Name = new Name(),
        public isAllowed: boolean = false,
        public isBlocked: boolean = false,
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.actor.N;
    }

    static getTable(code: Name): MultiIndex<Allowed> {
        return new MultiIndex<Allowed>(code, code, allowed);
    }
}

export class Allowed extends AllowedTable {}