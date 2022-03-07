import { ExtendedAsset, unpackActionData, Name, check, contract, action, Contract, MultiIndex, Singleton, requireAuth, isAccount, ActionWrapper, PermissionLevel, hasAuth, requireRecipient, notify } from 'as-chain'
import { startescrow, fillescrow, cancelescrow, logescrow, transfer, accounts, escrows, globall, atomicassets } from './constants';
import { NftTransfer, TokenTransfer, transfer_nfts, transfer_tokens } from './external';
import { account, Account, Escrow, global, escrow } from './tables';

class HelperContract extends Contract {
    static logEscrowAW: ActionWrapper = new ActionWrapper("logescrow");
    static transferAW: ActionWrapper = new ActionWrapper("transfer");

    getAccountsTable(): MultiIndex<account> {
        return new MultiIndex<account>(this.receiver, this.receiver, accounts);
    }
    
    getEscrowsTable(): MultiIndex<escrow> {
        return new MultiIndex<escrow>(this.receiver, this.receiver, escrows);
    }
    
    getConfigSingleton(): Singleton<global> {
        return new Singleton<global>(this.receiver, this.receiver, globall);
    }
}

@contract(escrow)
class EscrowContract extends HelperContract {
    /**
     * BALANCE
     */
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
            this.add_balance_nfts(t.from, t.asset_ids);
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
            this.add_balance_tokens(t.from, [balance_to_add]);
        }
    }

    add_balance_tokens (account: Name, tokens: ExtendedAsset[]): void {
        // Validation
        tokens.forEach(token => {
            check(token.quantity.isValid(), "valid quantity");
            check(token.quantity.amount > 0, "quantity must be positive");
        })

        // Get Account
        const accountsTable = this.getAccountsTable();
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

    add_balance_nfts(account: Name, nfts: u64[]): void {
        // Get Account
        const accountsTable = this.getAccountsTable();
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

    sub_balance_tokens (account: Name, tokens: ExtendedAsset[]): void {
        // Get Account
        const accountsTable = this.getAccountsTable();
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

    sub_balance_nfts(account: Name, nfts: u64[]): void {
        // Get Account
        const accountsTable = this.getAccountsTable();
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

    /**
     * Escrow
     */
    @action(startescrow)
    startescrow(
        from: Name,
        to: Name,
        fromTokens: ExtendedAsset[],
        fromNfts: u64[],
        toTokens: ExtendedAsset[],
        toNfts: u64[],
        expiry: u32
    ): void {
        requireAuth(from);

        // Validation
        // TODO
        // check(expiry > currentTimePoint().secSinceEpoch(), "expiry must be in future");
        check(to == new Name() || isAccount(to), "to must be empty or a valid account");

        // Substract balances
        this.sub_balance_tokens(from, fromTokens);
        this.sub_balance_nfts(from, fromNfts);
      
        // Get config
        const configSingleton = this.getConfigSingleton()
        const config = configSingleton.get()

        const newEscrow = new Escrow(
            config.escrow_id,
            from,
            to,
            fromTokens,
            fromNfts,
            toTokens,
            toNfts,
            expiry
        )

        // Update config
        config.escrow_id++;
        configSingleton.set(config, this.receiver);

        // Save escrow
        this.getEscrowsTable().store(newEscrow, from);

        // Log
        const action = EscrowContract.logEscrowAW.act(this.receiver, new PermissionLevel(this.receiver))
        const actionParams = new logescrowAction(newEscrow, "start")
        action.send(actionParams)
    }

    @action(fillescrow)
    fillescrow(
        fulfiller: Name,
        id: u64
    ): void {
        requireAuth(fulfiller);
  
        // Get Escrow
        const escrowsTable = this.getEscrowsTable();
        const escrowItr = escrowsTable.requireFind(id, "no escrow with ID found.");
        const existingEscrow = escrowsTable.get(escrowItr);
    
        check(hasAuth(existingEscrow.to) || hasAuth(existingEscrow.to), "incorrect to account");

        existingEscrow.to = fulfiller;
      
        // Substract balances
        this.sub_balance_tokens(existingEscrow.to, existingEscrow.toTokens);
        this.sub_balance_nfts(existingEscrow.to, existingEscrow.toNfts);
      
        // Send out
        transfer_tokens(this.receiver, existingEscrow.to, existingEscrow.toTokens, "");
        transfer_nfts(this.receiver, existingEscrow.to, existingEscrow.toNfts, "");
  
        // Log
        const action = EscrowContract.logEscrowAW.act(this.receiver, new PermissionLevel(this.receiver))
        const actionParams = new logescrowAction(existingEscrow, "fill")
        action.send(actionParams)

        // Erase
        escrowsTable.remove(escrowItr);
    }

    @action(cancelescrow)
    cancelescrow(
        id: u64
    ): void {
        // Get Escrow
        const escrowsTable = this.getEscrowsTable();
        const escrowItr = escrowsTable.requireFind(id, "no escrow with ID found.");
        const existingEscrow = escrowsTable.get(escrowItr);
    
        check(hasAuth(existingEscrow.from) || hasAuth(existingEscrow.to), "must have auth of from or to of escrow");

        requireRecipient(existingEscrow.from);
        requireRecipient(existingEscrow.to);
  
        // Log
        const action = EscrowContract.logEscrowAW.act(this.receiver, new PermissionLevel(this.receiver))
        const actionParams = new logescrowAction(existingEscrow, "cancel")
        action.send(actionParams)

        // Erase
        escrowsTable.remove(escrowItr);
    }

    @action(logescrow)
    logescrow(
        escrow: escrow,
        status: string
    ): void {
        requireAuth(this.receiver)
    }
}