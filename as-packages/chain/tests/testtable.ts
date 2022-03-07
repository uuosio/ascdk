import {
    Name,
    Asset,
    Contract,
    primary,
    contract,
    table,
    action,
    ExtendedAsset,
    requireAuth,
    Table,
} from "as-chain";


@table("globall", singleton)
export class global extends Table {
    constructor (
    public escrow_id: u64 = 0,
    ) {
        super();
    }
}

@table("escrows")
export class escrow extends Table {
    constructor (
    public id: u64 = 0,
    public from: Name = new Name(),
    public to: Name = new Name(),
    public fromTokens: ExtendedAsset[] = [],
    public fromNfts: u64[] = [],
    public toTokens: ExtendedAsset[] = [],
    public toNfts: u64[] = [],
    public expiry: u32 = 0,
    ) {
        super();
    }

    @primary
    get primary(): u64 {
        return this.id;
    }

    @secondary
    get byFrom(): u64 {
        return this.from.N;
    }

    @secondary
    set byFrom(value: u64) {
        this.from.N = value;
    }

    @secondary
    get byTo(): u64 {
        return this.to.N;
    }

    @secondary
    set byTo(value: u64) {
        this.to.N = value;
    }
}

@table("mytable")
class MyTable extends Table {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: Asset = new Asset()
    ) {
        super();
    }

    @primary
    get getPrimary(): u64 {
        return this.a;
    }
}

@contract("hello")
class MyContract extends Contract{
    @action("logescrow")
    logescrow(
        escrow: escrow,
        status: string
    ): void {
        requireAuth(this.receiver)
    }

    @action("testtable")
    testTable(): void {
        let mi = MyTable.new(this.receiver, this.receiver);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
