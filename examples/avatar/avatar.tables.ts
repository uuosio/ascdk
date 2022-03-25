import { Name, table, primary, Table, MultiIndex, packer } from "as-chain";
import { avatars } from "./avatar.constants";

@packer
export class KeyValue extends Table {
    constructor (
        public key: string = "",
        public value: string = "",
    ) {
        super();
    }
}

@table(avatars)
export class AvatarTable extends Table {
    constructor (
        public account: Name = new Name(),
        public values: KeyValue[] = [],
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.account.N;
    }

    static getTable(code: Name): MultiIndex<Avatar> {
        return new MultiIndex<Avatar>(code, code, avatars);
    }
}

export class Avatar extends AvatarTable {}