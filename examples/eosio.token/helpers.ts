import * as chain from 'as-chain';
import { AccountsTable, StatTable } from './tables';

export function getSupply(tokenContractAccount: chain.Name, sym: chain.Symbol): chain.Asset {
    const statstable = new chain.MultiIndex<StatTable>(
        tokenContractAccount,
        new chain.Name(sym.code()),
        chain.Name.fromString("stat"),
        [],
        () => new StatTable()
    );;

    const existing = statstable.find(sym.code());
    chain.check(existing.isOk(), "token with symbol does not exist");
    const st = statstable.get(existing);

    return st.supply;
}

export function getBalance(tokenContractAccount: chain.Name, owner: chain.Name, sym: chain.Symbol): chain.Asset {
    const acnts = new chain.MultiIndex<AccountsTable>(
        tokenContractAccount,
        owner,
        chain.Name.fromString("accounts"),
        [],
        () => new AccountsTable()
    );

    const existing = acnts.find(sym.code());
    chain.check(existing.isOk(), "no balance object found");
    const ac = acnts.get(existing);

    return ac.balance;
}