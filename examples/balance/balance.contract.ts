import { ExtendedAsset, unpackActionData, Name, check, action, Contract, notify, contract, requireAuth } from 'as-chain'
import { transfer, atomicassets, withdraw, balance } from './balance.constants';
import { NftTransfer, sendTransferNfts, sendTransferTokens, TokenTransfer } from './balance.inline';
import { Account } from './balance.tables';

@contract(balance)
export class BalanceContract extends Contract {

    @action(withdraw)
    withdraw(
        account: Name,
        tokens: ExtendedAsset[],
        nfts: u64[]
    ): void {
        requireAuth(account)

        // Substract Tokens and NFTs
        this.subBalanceTokens(account, tokens)
        this.subBalanceNfts(account, nfts)

        // Transfer Tokens and NFTs
        sendTransferTokens(this.receiver, account, tokens, "")
        sendTransferNfts(this.receiver, account, nfts, "")

        // Find account
        const accountsTable = Account.getTable(this.receiver);
        const accountItr = accountsTable.requireFind(account.N, "account does not exist");
        const existingAccount = accountsTable.get(accountItr);
        
        // If both nfts and tokens empty, delete account
        if (existingAccount.nfts.length == 0 && existingAccount.tokens.length == 0) {
            accountsTable.remove(accountItr);
        }
    }

    @action(transfer, notify)
    transfer(): void {
        if (this.receiver == atomicassets) {
            let t = unpackActionData<NftTransfer>()

            // Skip if outgoing
            if (t.from == this.receiver) {
                return;
            }
        
            // Validate transfer
            check(t.to == this.receiver, "Invalid Deposit");
        
            // Add nfts
            this.addBalanceNfts(t.from, t.asset_ids);
        } else {
            let t = unpackActionData<TokenTransfer>()

            // Skip if outgoing
            if (t.from == this.receiver) {
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
            check(t.to == this.receiver, "Invalid Deposit");
        
            // Deposit
            const token_contract = this.firstReceiver
            check(token_contract == Name.fromString("eosio.token"), "only eosio.token tokens are supported");
        
            // Add balance
            const balance_to_add = new ExtendedAsset(t.quantity, token_contract)
            this.addBalanceTokens(t.from, [balance_to_add]);
        }
    }

    addBalanceTokens(account: Name, tokens: ExtendedAsset[]): void {
        // Validation
        tokens.forEach(token => {
            check(token.quantity.isValid(), "valid quantity");
            check(token.quantity.amount > 0, "quantity must be positive");
        })

        // Get Account
        const accountsTable = Account.getTable(this.receiver);
        const accountItr = accountsTable.find(account.N);
    
        // Account does not exist
        if (!accountItr.isOk) {
            const newAccount = new Account(account, tokens);
            accountsTable.store(newAccount, account);
        }
        // Account exists
        else
        {
            const existingAccount = accountsTable.get(accountItr);
    
            // Loop over tokens to add
            for (let i = 0; i < tokens.length; i++) {
                // Assign token
                const token = tokens[i]

                // Find index of token
                let tokenIndex = -1
                for (let j = 0; j < existingAccount.tokens.length; j++) {
                    if (existingAccount.tokens[j].getExtendedSymbol() == token.getExtendedSymbol()) {
                        tokenIndex = j;
                        break;
                    }
                }

                // If token does not exist, add it
                if (tokenIndex == -1) {
                    existingAccount.tokens.push(token)
                }
                // If token exists, update balance
                else {
                    existingAccount.tokens[tokenIndex] = ExtendedAsset.add(existingAccount.tokens[tokenIndex], token)
                }

                // Save to table
                accountsTable.update(accountItr, existingAccount, account);
            }
        }
    }

    addBalanceNfts(account: Name, nfts: u64[]): void {
        // Get Account
        const accountsTable = Account.getTable(this.receiver);
        const accountItr = accountsTable.find(account.N);
    
        // Account does not exist
        if (!accountItr.isOk) {
            const newAccount = new Account(account, [], nfts);
            accountsTable.store(newAccount, account);
        }
        // Account exists
        else
        {
            const existingAccount = accountsTable.get(accountItr);

            // Add all NFTs
            for (let i = 0; i < nfts.length; i++) {
                existingAccount.nfts.push(nfts[i])
            }

            // Save to table
            accountsTable.update(accountItr, existingAccount, account);
        }
    }

    subBalanceTokens(account: Name, tokens: ExtendedAsset[]): void {
        // Get Account
        const accountsTable = Account.getTable(this.receiver);
        const accountItr = accountsTable.requireFind(account.N, "account does not exist");
        const existingAccount = accountsTable.get(accountItr);
    
        // Loop over tokens to sub
        for (let i = 0; i < tokens.length; i++) {
            // Assign token
            const token = tokens[i]

            // Validation
            check(token.quantity.isValid(), "valid quantity");
            check(token.quantity.amount > 0, "quantity must be positive");
            
            // Find index of token
            let tokenIndex = -1
            for (let j = 0; j < existingAccount.tokens.length; j++) {
                if (existingAccount.tokens[j].getExtendedSymbol() == token.getExtendedSymbol()) {
                    tokenIndex = j
                    break;
                }
            }
            check(tokenIndex != -1, "no balance found for user to reduce balance")
            check(existingAccount.tokens[tokenIndex] >= token, "user balance too low");

            // Substract balance
            existingAccount.tokens[tokenIndex] = ExtendedAsset.sub(existingAccount.tokens[tokenIndex], token)

            // Remove if balance is 0
            if (existingAccount.tokens[tokenIndex].quantity.amount == 0) {
                existingAccount.tokens.splice(tokenIndex, 1)
            }

            // Save to table
            accountsTable.update(accountItr, existingAccount, account);
        }
    }

    subBalanceNfts(account: Name, nfts: u64[]): void {
        // Get Account
        const accountsTable = Account.getTable(this.receiver);
        const accountItr = accountsTable.requireFind(account.N, "account does not exist");
        const existingAccount = accountsTable.get(accountItr);
    
        // Loop over all NFTs to remove
        for (let i = 0; i < nfts.length; i++) {
            // Assign NFT
            const nft = nfts[i]

            // Find NFT in balance and delete if found
            for (let j = 0; j < existingAccount.nfts.length; j++) {
                if (existingAccount.nfts[j] == nft) {
                    existingAccount.nfts.splice(j, 1)
                }
            }
        }

        // Save to table
        accountsTable.update(accountItr, existingAccount, account);
    }
}