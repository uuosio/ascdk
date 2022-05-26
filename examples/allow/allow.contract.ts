import { Name, Singleton, Contract, check, requireAuth, MultiIndex, SAME_PAYER } from 'as-chain'
import { AllowedActor, Paused } from './allow.tables';

enum UpdateFields {
    IS_ALLOWED = 0,
    IS_BLOCKED = 1,
};

@contract
export class AllowContract extends Contract {
    contract: Name = this.receiver
    parentContract: Name = this.firstReceiver

    allowedActorTable: MultiIndex<AllowedActor> = AllowedActor.getTable(this.receiver)
    pausedSingleton: Singleton<Paused> = Paused.getSingleton(this.receiver)

    /**
     * Set the paused state of the contract
     * @param {boolean} isPaused - boolean
     */
    @action("setpaused")
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
    @action("allowactor")
    allowactor(
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
    @action("blockactor")
    blockactor(
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
        let allowedActorItr = this.allowedActorTable.find(actor.N)
        if (!allowedActorItr.isOk()) {
            allowedActorItr = this.allowedActorTable.store(new AllowedActor(actor), this.contract)
        }

        // Get allowed entry
        const allowedActor = this.allowedActorTable.get(allowedActorItr)

        // Update allowed
        if (fieldToUpdate == UpdateFields.IS_ALLOWED) {
            allowedActor.isAllowed = fieldValue

            if (allowedActor.isAllowed) {
                allowedActor.isBlocked = false
            }
        } else if (fieldToUpdate == UpdateFields.IS_BLOCKED) {
            allowedActor.isBlocked = fieldValue

            if (allowedActor.isBlocked) {
                allowedActor.isAllowed = false
            }
        }

        // Save
        if (!allowedActor.isAllowed && !allowedActor.isBlocked) {
            this.allowedActorTable.remove(allowedActorItr)
        } else {
            this.allowedActorTable.update(allowedActorItr, allowedActor, SAME_PAYER);
        }
    }

    /**
     * Helper functions
     */
    isActorAllowed(actor: Name): boolean {
        // Find entry
        const allowedActorItr = this.allowedActorTable.find(actor.N)

        // If no entry found, account is allowed
        if (!allowedActorItr.isOk()) {
            return true
        }

        // Get entry
        const allowed = this.allowedActorTable.get(allowedActorItr)

        // isAllowed = true
        //     or
        // isBlocked = false
        return allowed.isAllowed || !allowed.isBlocked
    }

    checkActorIsAllowed(actor: Name): void {
        check(this.isActorAllowed(actor), `Actor ${actor} is now allowed to use ${this.contract}`)
    }

    isContractPaused(): boolean {
        return this.pausedSingleton.get().isPaused
    }

    checkContractIsNotPaused(): void {
        check(!this.isContractPaused(), `Contract ${this.contract} is paused`)
    }
}