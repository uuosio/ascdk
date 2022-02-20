import { Name, Asset, Symbol, check, requireAuth, MultiIndex, hasAuth, isAccount, requireRecipient } from 'as-chain'
import { AccountsTable, StatTable } from './tables';

@contract("eosio.token")
class TokenContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name
    accountTable: AccountsTable;
    statTable: StatTable;

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
        this.accountTable = new AccountsTable()
        this.statTable = new StatTable()
    }

    getStatTable(sym: Symbol): MultiIndex<StatTable> {
        return new MultiIndex<StatTable>(
            this.receiver,
            new Name(sym.code()),
            Name.fromString("stat"),
            () => new StatTable()
        );
    }

    getAccountsTable(accountName: Name): MultiIndex<AccountsTable> {
        return new MultiIndex<AccountsTable>(
            this.receiver,
            accountName,
            Name.fromString("accounts"),
            () => new AccountsTable()
            );
    }

    @action("create")
    create(issuer: Name, maximum_supply: Asset): void {
        requireAuth(this.receiver);

        const sym = maximum_supply.symbol;
        check(sym.isValid(), "invalid symbol name");
        check(maximum_supply.isValid(), "invalid supply");
        check(maximum_supply.amount > 0, "max-supply must be positive");

        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.code());
        check(!existing.isOk(), "token with symbol already exists");

        const value = new StatTable(
            new Asset(<i64>0, maximum_supply.symbol),
            maximum_supply,
            issuer
        );
        statstable.store(value, this.receiver);
    }

    @action("issue")
    issue(to: Name, quantity: Asset, memo: string): void {
        const sym = quantity.symbol;
        check(sym.isValid(), "invalid symbol name");
        check(memo.length <= 256, "memo has more than 256 bytes");

        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.code());
        check(existing.isOk(), "token with symbol does not exist, create token before issue");
        const st = statstable.get(existing);
        check(to == st.issuer,  "tokens can only be issued to issuer account");

        requireAuth(st.issuer);
        check(quantity.isValid(), "invalid quantity");
        check(quantity.amount > 0, "must issue positive quantity");

        check(quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
        check(quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

        st.supply = st.supply + quantity;
        statstable.update(existing, st, new Name(0));

        this.addBalance( st.issuer, quantity, st.issuer );
    }

    @action("retire")
    retire(quantity: Asset, memo: string): void {
        const sym = quantity.symbol;
        check(sym.isValid(), "invalid symbol name");
        check(memo.length <= 256, "memo has more than 256 bytes");

        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.code());
        check(existing.isOk(), "token with symbol does not exist");
        const st = statstable.get(existing);

        requireAuth(st.issuer);
        check(quantity.isValid(), "invalid quantity");
        check(quantity.amount > 0, "must retire positive quantity");

        check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );

        st.supply = st.supply - quantity;
        statstable.update(existing, st, new Name(0));

        this.subBalance(st.issuer, quantity);
    }

    @action("transfer")
    transfer(from: Name, to: Name, quantity: Asset, memo: string): void {
        check(from != to, "cannot transfer to self");
        requireAuth(from);
        check(isAccount(to), "to account does not exist");
        const sym = quantity.symbol;
        const statstable = this.getStatTable(sym);
        const existing = statstable.find(sym.code());
        check(existing.isOk(), "token with symbol does not exist");
        const st = statstable.get(existing);

        requireRecipient(from);
        requireRecipient(to);

        check(quantity.isValid(), "invalid quantity");
        check(quantity.amount > 0, "must transfer positive quantity");
        check(quantity.symbol == st.supply.symbol, "symbol precision mismatch");
        check(memo.length <= 256, "memo has more than 256 bytes");

        const payer = hasAuth(to) ? to : from;

        this.subBalance(from, quantity);
        this.addBalance(to, quantity, payer);
    }

    subBalance(owner: Name, value: Asset): void {
        const fromAcnts = this.getAccountsTable(owner);

        const from = fromAcnts.find(value.symbol.code());
        check(from.isOk(), "no balance object found");

        const account = fromAcnts.get(from);
        check(account.balance.amount >= value.amount, "overdrawn balance");

        account.balance = account.balance - value;
        fromAcnts.update(from, account, owner);
    }

    addBalance(owner: Name, value: Asset, ramPayer: Name): void {
        const toAcnts = this.getAccountsTable(owner);
        const to = toAcnts.find(value.symbol.code());
        if (!to.isOk()) {
            const account = new AccountsTable(value);
            toAcnts.store(account, ramPayer);
        } else {
            const account = toAcnts.get(to);
            account.balance = account.balance + value;
            toAcnts.update(to, account, ramPayer);
        }
    }

    @action("open")
    open(owner: Name, symbol: Symbol, ram_payer: Name): void {
        requireAuth(ram_payer);

        check(isAccount(owner), "owner account does not exist");

        const statstable = this.getStatTable(symbol);
        const existing = statstable.find(symbol.code());
        check(existing.isOk(), "symbol does not exist");
        const st = statstable.get(existing);
        check(st.supply.symbol == symbol, "symbol precision mismatch");

        const acnts = this.getAccountsTable(owner);
        const it = acnts.find(symbol.code());
        if (!it.isOk()) {
            const account = new AccountsTable(new Asset(<i64>0, symbol));
            acnts.store(account, ram_payer);
        }
    }

    @action("close")
    close(owner: Name, symbol: Symbol): void {
        requireAuth(owner);
        const acnts = this.getAccountsTable(owner);
        const it = acnts.find(symbol.code());
        check(it.isOk(), "Balance row already deleted or never existed. Action won't have any effect.");

        const account = acnts.get(it);
        check(account.balance.amount == 0, "Cannot close because the balance is not zero.");
        acnts.remove(it);
    }
}

export function createTokenContract (contractAccount: Name): TokenContract {
    return new TokenContract(contractAccount, new Name(0), new Name(0));
}