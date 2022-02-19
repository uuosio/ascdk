import * as chain from "as-chain";

@table("accounts")
class account {
    balance: chain.Asset;

    constructor (balance: chain.Asset = new chain.Asset()) {
        this.balance = balance;
    }

    @primary
    get primary(): u64 {
        return this.balance.symbol.code();
    }
}

@table("stat")
class currency_stats {
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
        return this.supply.symbol.code();
    }
}

export class AccountsTable extends account {}
export class StatTable extends currency_stats {}
