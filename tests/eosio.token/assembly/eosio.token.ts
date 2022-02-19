import * as chain from 'as-chain';
import { AccountsTable, StatTable } from './tables';

@contract("eosio.token")
class TokenContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name
    accountTable: AccountsTable;
    statTable: StatTable;

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
        this.accountTable = new AccountsTable()
        this.statTable = new StatTable()
    }

    getStatTable(sym: chain.Symbol): chain.MultiIndex<StatTable> {
        return new chain.MultiIndex<StatTable>(
            this.receiver,
            new chain.Name(sym.value),
            chain.Name.fromString("stat"),
            [],
            () => new StatTable()
        );
    }

    getAccountsTable(account: chain.Name, sym: chain.Symbol): chain.MultiIndex<AccountsTable> {
        return new chain.MultiIndex<AccountsTable>(
            this.receiver,
            account,
            chain.Name.fromString("accounts"),
            [],
            () => new AccountsTable()
        );
    }

    @action("create")
    create(issuer: chain.Name, maximum_supply: chain.Asset): void {
        chain.requireAuth(this.receiver);

        const sym = maximum_supply.symbol;
        // check(sym.isValid(), "invalid symbol name");
        // check(maximumSupply.isValid(), "invalid supply");
        chain.check(maximum_supply.amount > 0, "max-supply must be positive");

        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.value);
        chain.check(existing.isEnd(), "token with symbol already exists");

        const value = new StatTable(
            new chain.Asset(<i64>0, maximum_supply.symbol),
            maximum_supply,
            issuer
        );
        statstable.store(value, this.receiver);
    }

    @action("issue")
    issue(to: chain.Name, quantity: chain.Asset, memo: string): void {
        const sym = quantity.symbol;
        // check(sym.isValid(), "invalid symbol name");
        chain.check(memo.length <= 256, "memo has more than 256 bytes");

        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.value);
        chain.check(existing.isOk(), "token with symbol does not exist, create token before issue");
        const st = statstable.get(existing);
        chain.check(to == st.issuer,  "tokens can only be issued to issuer account");

        chain.requireAuth(st.issuer);
        // check(quantity.isValid(), "invalid quantity");
        chain.check(quantity.amount > 0, "must issue positive quantity");

        chain.check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
        chain.check( quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

        st.supply = st.supply + quantity;
        statstable.update(existing, st, new chain.Name(0));

        this.addBalance( st.issuer, quantity, st.issuer );
    }

    @action("retire")
    retire(quantity: chain.Asset, memo: string): void {
        const sym = quantity.symbol;
        // check(sym.isValid(), "invalid symbol name");
        chain.check(memo.length <= 256, "memo has more than 256 bytes");

        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.value);
        chain.check(existing.isOk(), "token with symbol does not exist");
        const st = statstable.get(existing);

        chain.requireAuth(st.issuer);
        // check(quantity.isValid(), "invalid quantity");
        chain.check(quantity.amount > 0, "must retire positive quantity");

        chain.check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );

        st.supply = st.supply - quantity;
        statstable.update(existing, st, new chain.Name(0));

        this.subBalance(st.issuer, quantity);
    }

    @action("transfer")
    transfer(from: chain.Name, to: chain.Name, quantity: chain.Asset, memo: string): void {
        chain.check(from != to, "cannot transfer to self");
        chain.requireAuth(from);
        chain.check(chain.isAccount(to), "to account does not exist");
        const sym = quantity.symbol;
        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.value);
        chain.check(existing.isOk(), "token with symbol does not exist");
        const st = statstable.get(existing);

        chain.requireRecipient(from);
        chain.requireRecipient(to);

        // check(quantity.isValid(), "invalid quantity");
        chain.check(quantity.amount > 0, "must transfer positive quantity");
        chain.check(quantity.symbol == st.supply.symbol, "symbol precision mismatch");
        chain.check(memo.length <= 256, "memo has more than 256 bytes");

        const payer = chain.hasAuth(to) ? to : from;

        this.subBalance(from, quantity);
        this.addBalance(to, quantity, payer);
    }

    subBalance(owner: chain.Name, value: chain.Asset): void {
        const fromAcnts = this.getAccountsTable(owner, value.symbol);

        const from = fromAcnts.find(value.symbol.value);
        chain.check(from.isOk(), "no balance object found");

        const account = fromAcnts.get(from);
        chain.check(account.balance.amount >= value.amount, "overdrawn balance");

        account.balance = account.balance - value;
        fromAcnts.update(from, account, owner);
    }

    addBalance(owner: chain.Name, value: chain.Asset, ramPayer: chain.Name): void {
        const toAcnts = this.getAccountsTable(owner, value.symbol);
        const to = toAcnts.find(value.symbol.value);
        if (to.isEnd()) {
            const account = new AccountsTable(value);
            toAcnts.store(account, ramPayer);
        } else {
            const account = toAcnts.get(to);
            account.balance = account.balance + value;
            toAcnts.update(to, account, ramPayer);
        }
    }

    @action("open")
    open(owner: chain.Name, symbol: chain.Symbol, ram_payer: chain.Name): void {
        chain.requireAuth(ram_payer);

        chain.check(chain.isAccount(owner), "owner account does not exist");

        const statstable = this.getStatTable(symbol);
        const existing = statstable.find(symbol.value);
        chain.check(existing.isOk(), "symbol does not exist");
        const st = statstable.get(existing);
        chain.check(st.supply.symbol == symbol, "symbol precision mismatch");

        const acnts = this.getAccountsTable(owner, symbol);
        const it = acnts.find(symbol.value);
        if (it.isEnd()) {
            const account = new AccountsTable(new chain.Asset(<i64>0, symbol));
            acnts.store(account, ram_payer);
        }
    }

    @action("close")
    close(owner: chain.Name, symbol: chain.Symbol): void {
        chain.requireAuth(owner);
        const acnts = this.getAccountsTable(owner, symbol);
        const it = acnts.find(symbol.value);
        chain.check(it.isOk(), "Balance row already deleted or never existed. Action won't have any effect.");

        const account = acnts.get(it);
        chain.check(account.balance.amount == 0, "Cannot close because the balance is not zero.");
        acnts.remove(it);
    }
}
