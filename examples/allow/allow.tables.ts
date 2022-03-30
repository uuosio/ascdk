import { Name, Table, MultiIndex, Singleton } from "as-chain";
import { allowedactor, paused } from "./allow.constants";

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
@table(allowedactor)
export class AllowedActorTable extends Table {
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

    static getTable(code: Name): MultiIndex<AllowedActor> {
        return new MultiIndex<AllowedActor>(code, code, allowedactor);
    }
}

export class AllowedActor extends AllowedActorTable {}

// // scope: contract
// @table(allowedtoken)
// export class AllowedTable extends Table {
//     constructor (
//         public actor: Name = new Name(),
//         public isAllowed: boolean = false,
//         public isBlocked: boolean = false,
//     ) {
//         super();
//     }

//     @primary
//     get primary(): u64 {
//         return this.actor.N;
//     }

//     static getTable(code: Name): MultiIndex<Allowed> {
//         return new MultiIndex<Allowed>(code, code, allowed);
//     }
// }

// export class AllowedToke extends AllowedTable {}