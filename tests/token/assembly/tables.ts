import { Asset, Name } from "as-chain";

@table("accounts")
class _AccountTable {
    balance: Asset = new Asset();

    @primary
    get primary(): u64 {
        return this.balance.symbol.value;
    }
}

@table("stat")
class _StatTable {
    supply: Asset = new Asset();
    max_supply: Asset = new Asset();
    issuer: Name = new Name();

    @primary
    get primary(): u64 {
        return this.supply.symbol.value;
    }
}

export class AccountTable extends _AccountTable {}
export class StatTable extends _StatTable {}
