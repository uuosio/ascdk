import * as chain from 'as-chain';
import { AccountTable, StatTable } from './tables';

@contract("token")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name
    accountTable: AccountTable;
    statTable: StatTable;

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
        this.accountTable = new AccountTable()
        this.statTable = new StatTable()
    }

    @action("create")
    create(issuer: chain.Name, maximum_supply: chain.Asset): void {
        chain.requireAuth(this.receiver);

        const sym = maximum_supply.symbol;
        // check(sym.isValid(), "invalid symbol name");
        // check(maximumSupply.isValid(), "invalid supply");
        chain.check(maximum_supply.amount > 0, "max-supply must be positive");


    }
}
