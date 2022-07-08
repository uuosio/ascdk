import {
    Name,
    Asset,
    Contract,
    ExtendedAsset,
    requireAuth,
    Table,

    Encoder,
    Decoder,
    MultiIndexValue,
    SecondaryValue,
    SecondaryType,
    MultiIndex,
    IDXDB,
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

    set byFrom(value: u64) {
        this.from.N = value;
    }

    @secondary
    get byTo(): u64 {
        return this.to.N;
    }

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

class MyTable2DB extends MultiIndex<MyTable2> {
}

@table("mytable2", nocodegen)
class MyTable2 implements MultiIndexValue {
    
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: Asset = new Asset()
    ) {
        
    }

    @primary
    get getPrimary(): u64 {
        return this.a;
    }

    pack(): u8[] {
        let enc = new Encoder(this.getSize());
        enc.packNumber<u64>(this.a);
        enc.packNumber<u64>(this.b);
        enc.pack(this.c);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.a = dec.unpackNumber<u64>();
        this.b = dec.unpackNumber<u64>();
        
        {
            let obj = new Asset();
            dec.unpack(obj);
            this.c = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += sizeof<u64>();
        size += this.c.getSize();
        return size;
    }

    getPrimaryValue(): u64 {
        return this.getPrimary
    }

    getSecondaryValue(i: i32): SecondaryValue {
        switch (i) {
            default:
                assert(false, "bad db index!");
                return new SecondaryValue(SecondaryType.U64, new Array<u64>(0));
        }
    }

    setSecondaryValue(i: i32, value: SecondaryValue): void {
        switch (i) {
            default:
                assert(false, "bad db index!");
        }
    }

    static new(code: Name, scope: Name): MyTable2DB {
        let tableName = Name.fromU64(0x97B263C542000000);
        let idxTableBase: u64 = (tableName.N & 0xfffffffffffffff0);

        let indices: IDXDB[] = [
        ];
        return new MyTable2DB(code, scope, tableName, indices);
    }
}

@contract
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
        let a: u8[] = [1, 2, 3];
        let b = changetype<usize>(a);
        let mi = MyTable.new(this.receiver);
        let value = new MyTable(1, 2);
        mi.store(value, this.receiver);
    }
}
