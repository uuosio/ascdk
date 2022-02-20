import { Asset, Name, table, primary } from "as-chain";

@table("accounts")
class account {
    balance: Asset;

    constructor (balance: Asset = new Asset()) {
        this.balance = balance;
    }

    @primary
    get primary(): u64 {
        return this.balance.symbol.code();
    }
}

@table("stat")
class currency_stats {
    supply: Asset;
    max_supply: Asset;
    issuer: Name;

    constructor (
       supply: Asset = new Asset(),
       max_supply: Asset =  new Asset(),
       issuer: Name = new Name(),
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
