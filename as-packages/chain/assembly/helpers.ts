import { PermissionLevel, Action } from "./action"
import { Name } from "./name"
import { Packer } from "./serializer"

export class ActionWrapperAct {
    constructor(
        public action: Name,
        public contract: Name,
        public permissionLevel: PermissionLevel
    ){}

    send <T extends Packer>(data: T): void {
        const permissions = [this.permissionLevel]
        const action = new Action(permissions, this.contract, this.action, data.pack())
        action.send()
    }
}

export class ActionWrapper {
    public action: Name
    constructor(action: string){
        this.action = Name.fromString(action)
    }

    /**
     * Create an action with act given contract, actor, and permission
     * @param {Name} contract - The name of the contract
     * @param {Name} actor - The name of the account that is executing the contract.
     * @param {string} permission - The permission that the actor must have to execute the contract.
     * @returns An instance of the Act class.
     */
    act (
        contract: Name,
        permissionLevel: PermissionLevel
    ): ActionWrapperAct {
        return new ActionWrapperAct(this.action, contract, permissionLevel)
    }
}

export class Contract {
    constructor(
        public receiver: Name,
        public firstReceiver: Name,
        public action: Name
    ) {}
}