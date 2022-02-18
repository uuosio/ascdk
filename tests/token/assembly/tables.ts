import { Asset, Name } from "as-chain";

@table("accounts")
class _AccountTable {
    a: u64;
    balance: Asset;

    constructor () {
        this.balance = new Asset();
    }

    @primary
    get primary(): u64 {
        return this.balance.symbol.value;
    }
}

@table("stat")
class _StatTable {
    supply: Asset;
    max_supply: Asset;
    issuer: Name;

    constructor () {
        this.supply = new Asset();
        this.max_supply = new Asset();
        this.issuer = new Name();
    }

    @primary
    get primary(): u64 {
        return this.supply.symbol.value;
    }
}

export class AccountTable extends _AccountTable {}
export class StatTable extends _StatTable {}
