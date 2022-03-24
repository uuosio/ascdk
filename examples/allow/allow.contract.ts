import { Name, Singleton, action, Contract, contract, check, requireAuth, MultiIndex, SAME_PAYER } from 'as-chain'
import { allow, setallowed, setblocked, setpaused } from './allow.constants';
import { Allowed, Paused } from './allow.tables';

enum UpdateFields {
    IS_ALLOWED = 0,
    IS_BLOCKED = 1,
};

@contract(allow)
export class AllowContract extends Contract {
    contract: Name = this.receiver
    parentContract: Name = this.firstReceiver

    allowedTable: MultiIndex<Allowed> = Allowed.getTable(this.receiver)
    pausedSingleton: Singleton<Paused> = Paused.getSingleton(this.receiver)

    /**
     * Set the paused state of the contract
     * @param {boolean} isPaused - boolean
     */
    @action(setpaused)
    setpaused(
        isPaused: boolean
    ): void {
        // Authenticate actor
        requireAuth(this.contract)

        // Set singleton
        const pausedObj = this.pausedSingleton.get()
        pausedObj.isPaused = isPaused
        this.pausedSingleton.set(pausedObj, this.contract);
    }

    /**
     * It sets the isAllowed field of the actor to the value of isAllowed.
     * @param {Name} actor - Name
     * @param {boolean} isAllowed - boolean
     */
    @action(setallowed)
    setallowed(
        actor: Name,
        isAllowed: boolean
    ): void {
        requireAuth(this.contract)
        this.updateAllowed(actor, UpdateFields.IS_ALLOWED, isAllowed)
    }

    /**
     * It sets the isBlocked field of the actor to the given value.
     * @param {Name} actor - Name
     * @param {boolean} isBlocked - boolean
     */
    @action(setblocked)
    setblocked(
        actor: Name,
        isBlocked: boolean
    ): void {
        requireAuth(this.contract)
        this.updateAllowed(actor, UpdateFields.IS_BLOCKED, isBlocked)
    }

    /**
     * Update the allowed table to set the isAllowed or isBlocked field to the given value
     * @param {Name} actor - Name
     * @param {UpdateFields} fieldToUpdate - The field to update.
     * @param {boolean} fieldValue - boolean
     */
    updateAllowed(actor: Name, fieldToUpdate: UpdateFields, fieldValue: boolean): void {
        // Find or create allowed entry
        let allowedItr = this.allowedTable.find(actor.N)
        if (!allowedItr.isOk()) {
            allowedItr = this.allowedTable.store(new Allowed(actor), this.contract)
        }

        // Get allowed entry
        const allowed = this.allowedTable.get(allowedItr)

        // Update allowed
        if (fieldToUpdate == UpdateFields.IS_ALLOWED) {
            allowed.isAllowed = fieldValue

            if (allowed.isAllowed) {
                allowed.isBlocked = false
            }
        } else if (fieldToUpdate == UpdateFields.IS_BLOCKED) {
            allowed.isBlocked = fieldValue

            if (allowed.isBlocked) {
                allowed.isAllowed = false
            }
        }

        // Save
        if (!allowed.isAllowed && !allowed.isBlocked) {
            this.allowedTable.remove(allowedItr)
        } else {
            this.allowedTable.update(allowedItr, allowed, SAME_PAYER);
        }
    }

    /**
     * Helper functions
     */
    isActorAllowed(actor: Name): boolean {
        // Find entry
        const allowedItr = this.allowedTable.find(actor.N)

        // If no entry found, account is allowed
        if (!allowedItr.isOk()) {
            return true
        }

        // Get entry
        const allowed = this.allowedTable.get(allowedItr)

        // isAllowed = true
        //     or
        // isBlocked = false
        return allowed.isAllowed || !allowed.isBlocked
    }

    checkActorIsAllowed(actor: Name): void {
        check(this.isActorAllowed(actor), `Actor ${actor} is now allowed to use ${contract}`)
    }

    isContractPaused(): boolean {
        return this.pausedSingleton.get().isPaused
    }

    checkContractIsNotPaused(): void {
        check(!this.isContractPaused(), `Contract ${this.contract} is paused`)
    }
}