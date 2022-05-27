import { currentTimePoint, ExtendedAsset, Name, check, requireAuth, isAccount, hasAuth, requireRecipient, SAME_PAYER, MultiIndex } from 'as-chain'
import { BalanceContract, OPERATION, sendTransferNfts, sendTransferTokens } from '../balance';
import { ESCROW_STATUS } from './escrow.constants';
import { sendLogEscrow } from './escrow.inline';
import { Global, Escrow, escrow } from './escrow.tables';

@contract
class EscrowContract extends BalanceContract {
    escrowsTable: MultiIndex<Escrow> = Escrow.getTable(this.receiver)

    @action("startescrow")
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
        check(expiry > currentTimePoint().secSinceEpoch(), "expiry must be in future");
        check(to == new Name() || isAccount(to), "to must be empty or a valid account");

        // Substract balances
        this.modifyBalance(from, fromTokens, fromNfts, OPERATION.SUB, SAME_PAYER)
      
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
        this.escrowsTable.store(newEscrow, from);

        // Log
        sendLogEscrow(this.receiver, newEscrow, ESCROW_STATUS.START);
    }

    @action("fillescrow")
    fillescrow(
        fulfiller: Name,
        id: u64
    ): void {
        requireAuth(fulfiller);
  
        // Get Escrow
        const escrowItr = this.escrowsTable.requireFind(id, "no escrow with ID found.");
        const existingEscrow = this.escrowsTable.get(escrowItr);
    
        check(existingEscrow.to == new Name() || hasAuth(existingEscrow.to), "incorrect to account");

        existingEscrow.to = fulfiller;
      
        // Substract balances
        this.modifyBalance(existingEscrow.to, existingEscrow.toTokens, existingEscrow.toNfts, OPERATION.SUB, SAME_PAYER)

        // Send out
        const memo = "escrow " + id.toString() + " completed!"
        sendTransferTokens(this.receiver, existingEscrow.to, existingEscrow.toTokens, memo);
        sendTransferNfts(this.receiver, existingEscrow.to, existingEscrow.toNfts, memo);
  
        // Log
        sendLogEscrow(this.receiver, existingEscrow, ESCROW_STATUS.FILL);

        // Erase
        this.escrowsTable.remove(escrowItr);
    }

    @action("cancelescrow")
    cancelescrow(
        id: u64
    ): void {
        // Get Escrow
        const escrowItr = this.escrowsTable.requireFind(id, "no escrow with ID found.");
        const existingEscrow = this.escrowsTable.get(escrowItr);
    
        check(hasAuth(existingEscrow.from) || hasAuth(existingEscrow.to), "must have auth of from or to of escrow");

        requireRecipient(existingEscrow.from);
        requireRecipient(existingEscrow.to);
  
        // Log
        sendLogEscrow(this.receiver, existingEscrow, ESCROW_STATUS.CANCEL);

        // Erase
        this.escrowsTable.remove(escrowItr);
    }

    @action("logescrow")
    logescrow(
        escrow: escrow,
        status: string
    ): void {
        requireAuth(this.receiver)
    }
}
