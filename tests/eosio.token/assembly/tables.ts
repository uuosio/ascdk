import * as chain from "as-chain";

@table("accounts")
class _AccountsTable {
    balance: chain.Asset;

    constructor (balance: chain.Asset = new chain.Asset()) {
        this.balance = balance;
    }

    @primary
    get primary(): u64 {
        return this.balance.symbol.value;
    }
}

@table("stat")
class _StatTable {
    supply: chain.Asset;
    max_supply: chain.Asset;
    issuer: chain.Name;

    constructor (
       supply: chain.Asset = new chain.Asset(),
       max_supply: chain.Asset =  new chain.Asset(),
       issuer: chain.Name = new chain.Name(),
    ) {
        this.supply = supply;
        this.max_supply = max_supply;
        this.issuer = issuer;
    }

    @primary
    get primary(): u64 {
        return this.supply.symbol.value;
    }
}

export class AccountsTable extends _AccountsTable {}
export class StatTable extends _StatTable {}
