import { check, requireAuth, Name, Asset } from 'as-chain'
import { AccountTable, StatTable } from './tables';

@contract("token")
class MyContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name
    accountTable: AccountTable;
    statTable: StatTable;

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
        this.accountTable = new AccountTable()
        this.statTable = new StatTable()
    }

    @action("create")
    create(issuer: Name, maximumSupply: Asset): void {
        requireAuth(this.receiver);

        const sym = maximumSupply.symbol;
        // check(sym.isValid(), "invalid symbol name");
        // check(maximumSupply.isValid(), "invalid supply");
        check(maximumSupply.amount > 0, "max-supply must be positive");


    }
}
