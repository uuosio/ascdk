import { Asset, Name, table, primary, Table } from "as-chain";

@table("accounts")
export class account extends Table {
    constructor (
        public balance: Asset = new Asset()
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.balance.symbol.code();
    }
}

@table("stat")
export class currency_stats extends Table {
    constructor (
       public supply: Asset = new Asset(),
       public max_supply: Asset =  new Asset(),
       public issuer: Name = new Name(),
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.supply.symbol.code();
    }
}

export class Account extends account {}
export class Stat extends currency_stats {}
