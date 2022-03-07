import { ExtendedAsset, Name, table, primary, Table, singleton, secondary } from "as-chain";
import { accounts, globall, escrows } from "./constants";

@table(accounts)
export class account extends Table {
    constructor (
        public name: Name = new Name(),
        public tokens: ExtendedAsset[] = [],
        public nfts: u64[] = [],
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.name.N;
    }
}

@table(globall, singleton)
export class global extends Table {
    constructor (
       public escrow_id: u64 = 0,
    ) {
        super();
    }
}

@table(escrows)
export class escrow extends Table {
    constructor (
       public id: u64 = 0,
       public from: Name = new Name(),
       public to: Name = new Name(),
       public fromTokens: ExtendedAsset[] = [],
       public fromNfts: u64[] = [],
       public toTokens: ExtendedAsset[] = [],
       public toNfts: u64[] = [],
       public expiry: u32 = 0,
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.id;
    }

    @secondary
    get byFrom(): u64 {
        return this.from.N;
    }

    set byFrom(value: u64) {
        this.from.N = value;
    }

    @secondary
    get byTo(): u64 {
        return this.to.N;
    }

    set byTo(value: u64) {
        this.to.N = value;
    }
}

export class Account extends account {}
export class Globall extends global {}
export class Escrow extends escrow {}