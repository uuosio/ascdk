import { PermissionLevel, Action } from "./action"
import { SecondaryValue, newSecondaryValue_u64, IDXDB } from "./idxdb"
import { MultiIndex, MultiIndexValue } from "./mi"
import { Name, EMPTY_NAME } from "./name"
import { Packer } from "./serializer"
import { check } from "./system"

export class Variant implements Packer {
    _index: u8;
    value: usize;

    getSize(): usize {
        check(false, "not implemented");
        return 0
    }

    get<T>(): T {
        check(false, "not implemented");
        return instantiate<T>()
    }

    is<T>(): bool {
        check(false, "not implemented");
        return false
    }

    pack(): u8[] {
        check(false, "not implemented");
        return []
    }

    unpack(data: u8[]): usize {
        check(false, "not implemented");
        return 0
    }
}

export class InlineActionAct <T extends Packer> {
    constructor(
        public action: Name,
        public contract: Name,
        public permissionLevel: PermissionLevel
    ){}

    send(data: T): void {
        const permissions = [this.permissionLevel]
        const action = new Action(permissions, this.contract, this.action, data.pack())
        action.send()
    }
}

export class InlineAction <T extends Packer> {
    public action: Name

    constructor(action: string){
        this.action = Name.fromString(action)
    }

    static fromName<T extends Packer>(name: Name): InlineAction<T> {
        return new InlineAction<T>(name.toString())
    }

    /**
     * Create an action with act given contract, actor, and permission
     * @param {Name} contract - The name of the contract
     * @param {Name} actor - The name of the account that is executing the contract.
     * @param {string} permission - The permission that the actor must have to execute the contract.
     * @returns An instance of the Act class.
     */
    act(
        contract: Name,
        permissionLevel: PermissionLevel
    ): InlineActionAct<T> {
        return new InlineActionAct(this.action, contract, permissionLevel)
    }
}

export class Contract {
    constructor(
        public receiver: Name,
        public firstReceiver: Name,
        public action: Name
    ) {}
}

export class MockPacker implements Packer {
    pack(): u8[] {
        check(false, "not implemented");
        return [];
    }
    
    unpack(_: u8[]): usize {
        check(false, "not implemented");
        return 0;
    }

    getSize(): usize {
        check(false, "not implemented");
        return 0;
    }
}

export class Table extends MockPacker implements MultiIndexValue  {
    static get tableName(): Name {
        check(false, "not implemented");
        return Name.fromU64(0);
    }

    static tableIndexes(_: Name, __: Name): IDXDB[] {
        check(false, "not implemented");
        return [];
    }

    getTableName(): Name {
        return Table.tableName;
    }

    getTableIndexes(_: Name, __: Name): IDXDB[] {
        return Table.tableIndexes(_, __)
    }

    getPrimaryValue(): u64 {
        check(false, "not implemented");
        return 0;
    }

    getSecondaryValue(_: i32): SecondaryValue {
        check(false, "not implemented");
        return newSecondaryValue_u64(0);
    }

    setSecondaryValue(_: usize, __: SecondaryValue): void {
        check(false, "not implemented");
    };

    static new(_: Name, __: Name = EMPTY_NAME): MultiIndex<Table> {
        check(false, "not implemented");
        // @ts-ignore
        return new MultiIndex<Table>(_, __, new Name(), []);
    }
}

export class ActionData extends MockPacker {}