import {
    Name,
    Asset,
    Action,
    PermissionLevel,
    ActionData
} from "as-chain"

export const MIXIN_WTOKENS: Name = Name.fromString("mixinwtokens");
export const MAX_SUPPLY: i64 = 100000000000000;

@packer
export class Create extends ActionData {
    constructor(
        public issuer: Name = new Name(),
        public maximum_supply: Asset = new Asset(),
    ){
        super()
    }

    send(actor: Name): void {
        let perm: Name = Name.fromString("active");
        let permission = new PermissionLevel(actor, perm);
        let account = MIXIN_WTOKENS;
        let name = Name.fromString("create");
        Action.new([permission], account, name, this).send();
    }
}

@packer
export class Issue extends ActionData {
    constructor(
        public to: Name = new Name(),
        public quantity: Asset = new Asset(),
        public memo: string = "",
    ) {
        super();
    }

    send(actor: Name): void {
        let perm: Name = Name.fromString("active");
        let permission = new PermissionLevel(actor, perm);
        let account = MIXIN_WTOKENS;
        let name = Name.fromString("issue");
        Action.new([permission], account, name, this).send();
    }

}

@packer
export class Retire extends ActionData {
    constructor(
        public quantity: Asset = new Asset(),
        public memo: string = "",
    ) {
        super();
    }

    send(actor: Name): void {
        let perm: Name = Name.fromString("active");
        let permission = new PermissionLevel(actor, perm);
        let account = MIXIN_WTOKENS;
        let name = Name.fromString("retire");
        Action.new([permission], account, name, this).send();
    }
}

@packer
export class Transfer extends ActionData {
    constructor(
        public from: Name = new Name(),
        public to: Name = new Name(),
        public quantity: Asset = new Asset(),
        public memo: string = ""
    ) {
        super();
    }

    send(actor: Name): void {
        let perm: Name = Name.fromString("active");
        let permission = new PermissionLevel(actor, perm);
        let account = MIXIN_WTOKENS;
        let name = Name.fromString("transfer");
        Action.new([permission], account, name, this).send();
    }
}

//table stat ignore
// type currency_stats struct {
// 	supply     chain.Asset //primary: t.supply.Symbol.Code()
// 	max_supply chain.Asset
// 	issuer     chain.Name
// }

@table("stat")
export class currency_stats {
    constructor(
        public supply: Asset = new Asset(),
        public max_supply: Asset = new Asset(),
        public issuer: Name = new Name,
    ){
    }

    @primary
    get getPrimary(): u64 {
        return this.supply.symbol.code();
    }
}
