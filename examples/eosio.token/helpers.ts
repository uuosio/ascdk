import { Name, Symbol, Asset, check } from 'as-chain';
import { createTokenContract } from './eosio.token';

export function getSupply(tokenContractAccount: Name, sym: Symbol): Asset {
    const contract = createTokenContract(tokenContractAccount);
    const statstable = contract.getStatTable(sym);

    const existing = statstable.find(sym.code());
    check(existing.isOk(), "token with symbol does not exist");
    const st = statstable.get(existing);

    return st.supply;
}

export function getBalance(tokenContractAccount: Name, owner: Name, sym: Symbol): Asset {
    const contract = createTokenContract(tokenContractAccount);
    const acnts = contract.getAccountsTable(owner);

    const existing = acnts.find(sym.code());
    check(existing.isOk(), "no balance object found");
    const ac = acnts.get(existing);

    return ac.balance;
}