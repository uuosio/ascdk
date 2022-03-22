import { ExtendedAsset, unpackActionData, Name, check, action, Contract, notify, contract, requireAuth, MultiIndex, SAME_PAYER } from 'as-chain'
import { transfer, atomicassets, withdraw, balance } from './balance.constants';
import { sendTransferTokens, sendTransferNfts, NftTransfer, TokenTransfer } from './balance.inline';
import { Account } from './balance.tables';
import { addNfts, addTokens, OPERATION, substractNfts, substractTokens } from './balance.utils';

@contract(balance)
export class BalanceContract extends Contract {
    accountsTable: MultiIndex<Account> = Account.getTable(this.receiver)
    contract: Name = this.receiver
    parentContract: Name = this.firstReceiver
    
    /**
     * Incoming notification of "transfer" action from any contract
     * - If the contract is the atomicassets contract, then the action data is an NFT transfer.
     * - Else, the action data is a token transfer
     * @returns Nothing.
     */
    @action(transfer, notify)
    transfer(): void {
        if (this.parentContract == atomicassets) {
            // Unpack nft transfer
            let t = unpackActionData<NftTransfer>()

            // Skip if outgoing
            if (t.from == this.contract) {
                return;
            }
        
            // Validate transfer
            check(t.to == this.contract, "Invalid Deposit");
        
            // Add nfts
            this.modifyAccount(t.from, [], t.asset_ids, OPERATION.ADD, this.contract)
        } else {
            // Unpack token transfer
            let t = unpackActionData<TokenTransfer>()

            // Skip if outgoing
            if (t.from == this.contract) {
                return;
            }
  
            // Skip if deposit from system accounts
            if (
                t.from == Name.fromString("eosio.stake") ||
                t.from == Name.fromString("eosio.ram") ||
                t.from == Name.fromString("eosio")
            ) {
                return
            }
        
            // Validate transfer
            check(t.to == this.contract, "Invalid Deposit");

            // Add balance
            const tokens = [new ExtendedAsset(t.quantity, this.parentContract)]
            this.modifyAccount(t.from, tokens, [], OPERATION.ADD, this.contract)
        }
    }

    /**
     * Withdraw tokens and NFTs from an account and transfer them to another account
     * @param {Name} account - Name
     * @param {ExtendedAsset[]} tokens - An array of `ExtendedAsset` objects.
     * @param {u64[]} nfts - u64[]
     */
    @action(withdraw)
    withdraw(
        account: Name,
        tokens: ExtendedAsset[],
        nfts: u64[]
    ): void {
        // Authenticate account
        requireAuth(account)

        // Substract Tokens and NFTs from account balance
        this.modifyAccount(account, tokens, nfts, OPERATION.SUB, SAME_PAYER)

        // Inline transfer Tokens and NFTs from contract to account
        sendTransferTokens(this.contract, account, tokens, "withdraw")
        sendTransferNfts(this.contract, account, nfts, "withdraw")
    }

    modifyAccount(account: Name, tokens: ExtendedAsset[], nfts: u64[], op: OPERATION, ramPayer: Name = account): void {
        // Find account
        const accountItr = this.accountsTable.find(account.N);
        if (!accountItr.isOk()) {
            this.accountsTable.store(new Account(account), ramPayer);
        }
        
        // Get account
        const accountObj = this.accountsTable.get(accountItr)

        // Operation
        if (op == OPERATION.ADD) {
            addTokens(accountObj, tokens)
            addNfts(accountObj, nfts)
        } else if (op == OPERATION.SUB) {
            substractTokens(accountObj, tokens)
            substractNfts(accountObj, nfts)
        }
    
        // Delete table if no NFTs and no tokens
        // Update table if any NFT or token found
        if (accountObj.nfts.length == 0 && accountObj.tokens.length == 0) {
            this.accountsTable.remove(accountItr);
        } else {
            this.accountsTable.update(accountItr, accountObj, ramPayer);
        }
    }
}