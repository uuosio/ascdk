import { currentTimePoint, ExtendedAsset, Name, check, contract, action, requireAuth, isAccount, hasAuth, requireRecipient } from 'as-chain'
import { BalanceContract, sendTransferNfts, sendTransferTokens } from '../balance';
import { startescrow, fillescrow, cancelescrow, logescrow, ESCROW_STATUS } from './escrow.constants';
import { sendLogEscrow } from './escrow.inline';
import { Global, Escrow, escrow } from './escrow.tables';

/**
 * Contract
 */
@contract(escrow)
class EscrowContract extends BalanceContract {
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
        check(expiry > currentTimePoint().secSinceEpoch(), "expiry must be in future");
        check(to == new Name() || isAccount(to), "to must be empty or a valid account");

        // Substract balances
        this.subBalanceTokens(from, fromTokens);
        this.subBalanceNfts(from, fromNfts);
      
        // Get config
        const configSingleton = Global.getSingleton(this.receiver)
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
        Escrow.getTable(this.receiver).store(newEscrow, from);

        // Log
        sendLogEscrow(this.receiver, newEscrow, ESCROW_STATUS.START);
    }

    @action(fillescrow)
    fillescrow(
        fulfiller: Name,
        id: u64
    ): void {
        requireAuth(fulfiller);
  
        // Get Escrow
        const escrowsTable = Escrow.getTable(this.receiver);
        const escrowItr = escrowsTable.requireFind(id, "no escrow with ID found.");
        const existingEscrow = escrowsTable.get(escrowItr);
    
        check(hasAuth(existingEscrow.to) || hasAuth(existingEscrow.to), "incorrect to account");

        existingEscrow.to = fulfiller;
      
        // Substract balances
        this.subBalanceTokens(existingEscrow.to, existingEscrow.toTokens);
        this.subBalanceNfts(existingEscrow.to, existingEscrow.toNfts);
      
        // Send out
        sendTransferTokens(this.receiver, existingEscrow.to, existingEscrow.toTokens, "");
        sendTransferNfts(this.receiver, existingEscrow.to, existingEscrow.toNfts, "");
  
        // Log
        sendLogEscrow(this.receiver, existingEscrow, ESCROW_STATUS.FILL);

        // Erase
        escrowsTable.remove(escrowItr);
    }

    @action(cancelescrow)
    cancelescrow(
        id: u64
    ): void {
        // Get Escrow
        const escrowsTable = Escrow.getTable(this.receiver);
        const escrowItr = escrowsTable.requireFind(id, "no escrow with ID found.");
        const existingEscrow = escrowsTable.get(escrowItr);
    
        check(hasAuth(existingEscrow.from) || hasAuth(existingEscrow.to), "must have auth of from or to of escrow");

        requireRecipient(existingEscrow.from);
        requireRecipient(existingEscrow.to);
  
        // Log
        sendLogEscrow(this.receiver, existingEscrow, ESCROW_STATUS.CANCEL);

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
