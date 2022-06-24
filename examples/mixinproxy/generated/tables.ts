import * as _chain from "as-chain";
import {
    Table,
    U128,
    U256,
    Name,
    PublicKey,
    Signature,
    Symbol,
    Asset,
} from "as-chain"



export class SignerDB extends _chain.MultiIndex<Signer> {

}

@table("signers", nocodegen)

export class Signer implements _chain.MultiIndexValue {
    
    account: u64;
    public_key!: PublicKey;

    @primary
    get getPrimary(): u64 {
        return this.account;
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.account);
        enc.pack(this.public_key);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.account = dec.unpackNumber<u64>();
        
        {
            let obj = new PublicKey();
            dec.unpack(obj);
            this.public_key = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += this.public_key.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xC399355F00000000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return Signer.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return Signer.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.getPrimary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): SignerDB {
        return new SignerDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}



export class globalDB extends _chain.MultiIndex<global> {

}

@table("global", singleton, nocodegen)

export class global implements _chain.MultiIndexValue {
    
    constructor (
    public escrow_id: u64 = 0,
    ) {
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.escrow_id);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.escrow_id = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x6468734400000000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return global.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return global.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return _chain.Name.fromU64(0x6468734400000000).N;
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): _chain.Singleton<global> {
        return new _chain.Singleton<global>(code, scope, this.tableName);
    }
}



export class TxEventDB extends _chain.MultiIndex<TxEvent> {

}

@table("txevents", nocodegen)

export class TxEvent implements _chain.MultiIndexValue {
    
	nonce:       u64; //primary : t.nonce
	process!:    U128;
	asset!:      U128;
	members!:    U128[];
	threshold:   i32;
	amount!:     U128;
	extra!:      u8[];
	timestamp:   u64;
	signatures!: Signature[];

    @primary
    get getPrimary(): u64 {
        return this.nonce
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.nonce);
        enc.pack(this.process);
        enc.pack(this.asset);
        enc.packObjectArray(this.members);
        enc.packNumber<i32>(this.threshold);
        enc.pack(this.amount);
        enc.packNumberArray<u8>(this.extra)
        enc.packNumber<u64>(this.timestamp);
        enc.packObjectArray(this.signatures);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.nonce = dec.unpackNumber<u64>();
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.process = obj;
        }
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.asset = obj;
        }
        
    {
        let length = <i32>dec.unpackLength();
        this.members = new Array<U128>(length)
        for (let i=0; i<length; i++) {
            let obj = new U128();
            this.members[i] = obj;
            dec.unpack(obj);
        }
    }

        this.threshold = dec.unpackNumber<i32>();
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.amount = obj;
        }
        this.extra = dec.unpackNumberArray<u8>();
        this.timestamp = dec.unpackNumber<u64>();
        
    {
        let length = <i32>dec.unpackLength();
        this.signatures = new Array<Signature>(length)
        for (let i=0; i<length; i++) {
            let obj = new Signature();
            this.signatures[i] = obj;
            dec.unpack(obj);
        }
    }

        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += this.process.getSize();
        size += this.asset.getSize();
        size += _chain.calcPackedVarUint32Length(this.members.length);
        for (let i=0; i<this.members.length; i++) {
            size += this.members[i].getSize();
        }

        size += sizeof<i32>();
        size += this.amount.getSize();
        size += _chain.calcPackedVarUint32Length(this.extra.length);size += sizeof<u8>()*this.extra.length;
        size += sizeof<u64>();
        size += _chain.calcPackedVarUint32Length(this.signatures.length);
        for (let i=0; i<this.signatures.length; i++) {
            size += this.signatures[i].getSize();
        }

        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xCF55B54F38000000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return TxEvent.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return TxEvent.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.getPrimary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): TxEventDB {
        return new TxEventDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}



export class AccountCacheDB extends _chain.MultiIndex<AccountCache> {

}

@table("accountcache", singleton, nocodegen)

export class AccountCache implements _chain.MultiIndexValue {
    
    constructor(
        public id: u64 = 0,
        public account: Name = new Name(),
    ){

    }

    @primary
    get getPrimary(): u64 {
        return this.id
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.id);
        enc.pack(this.account);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.id = dec.unpackNumber<u64>();
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.account = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += this.account.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x32114D4F28321AA0);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return AccountCache.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return AccountCache.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return _chain.Name.fromU64(0x32114D4F28321AA0).N;
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): _chain.Singleton<AccountCache> {
        return new _chain.Singleton<AccountCache>(code, scope, this.tableName);
    }
}


//table mixinassets
// type MixinAsset struct {
// 	symbol   chain.Symbol  //primary : t.symbol.Code()
// 	asset_id chain.Uint128 //IDX128: ByAssetId : t.asset_id : t.asset_id
// }



export class MixinAssetDB extends _chain.MultiIndex<MixinAsset> {
    get byAssetIdDB(): _chain.IDX128 {
        return <_chain.IDX128>this.idxdbs[0];
    }

    updateByAssetId(idxIt: _chain.SecondaryIterator, value: U128, payer: Name): _chain.IDX128 {
    let secValue = _chain.newSecondaryValue_U128(value);
    this.idxUpdate(idxIt, secValue, payer);
    return <_chain.IDX128>this.idxdbs[0];
}
}

@table("mixinassets", nocodegen)

export class MixinAsset implements _chain.MultiIndexValue {
    

    constructor(
        public symbol: Symbol = new Symbol(),
        public asset_id: U128 = new U128(),
    ){

    }

    @primary
    get getPrimary(): u64 {
        return this.symbol.code();
    }

    @secondary
    get byAssetId(): U128 {
        return this.asset_id;
    }

    set byAssetId(value: U128) {
        this.asset_id = value;
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.symbol);
        enc.pack(this.asset_id);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Symbol();
            dec.unpack(obj);
            this.symbol = obj;
        }
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.asset_id = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.symbol.getSize();
        size += this.asset_id.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x93BAE99B18567000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
            new _chain.IDX128(code.N, scope.N, idxTableBase + 0, 0),
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return MixinAsset.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return MixinAsset.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.getPrimary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        switch (i) {
            case 0: {
                return _chain.newSecondaryValue_U128(this.byAssetId);
                break;
            }
            default:
                _chain.assert(false, "bad db index!");
                return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
        }
    }

    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        switch (i) {
            case 0: {
                let _value = _chain.getSecondaryValue_U128(value);
                this.byAssetId = _value;
                break;
            }
            default:
                _chain.assert(false, "bad db index!");
        }
    }


    static new(code: _chain.Name, scope: _chain.Name): MixinAssetDB {
        return new MixinAssetDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}

//table createaccfee singleton
// type CreateAccountFee struct {
// 	fee chain.Asset
// }



export class CreateAccountFeeDB extends _chain.MultiIndex<CreateAccountFee> {

}

@table("createaccfee", singleton, nocodegen)

export class CreateAccountFee implements _chain.MultiIndexValue {
    
    constructor(
        public fee: Asset = new Asset()
    ){}

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.fee);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Asset();
            dec.unpack(obj);
            this.fee = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.fee.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x45D46CA8C842D4A0);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return CreateAccountFee.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return CreateAccountFee.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return _chain.Name.fromU64(0x45D46CA8C842D4A0).N;
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): _chain.Singleton<CreateAccountFee> {
        return new _chain.Singleton<CreateAccountFee>(code, scope, this.tableName);
    }
}



export class MixinAccountDB extends _chain.MultiIndex<MixinAccount> {
    get byClientIdDB(): _chain.IDX128 {
        return <_chain.IDX128>this.idxdbs[0];
    }

    updateByClientId(idxIt: _chain.SecondaryIterator, value: U128, payer: Name): _chain.IDX128 {
    let secValue = _chain.newSecondaryValue_U128(value);
    this.idxUpdate(idxIt, secValue, payer);
    return <_chain.IDX128>this.idxdbs[0];
}
}

@table("bindaccounts", nocodegen)

export class MixinAccount implements _chain.MultiIndexValue {
    
    constructor(
        public eos_account: Name = new Name(),
        public client_id: U128 = new U128,
    ){}

    @primary
    get getPrimary(): u64 {
        return this.eos_account.N;
    }

    @secondary
    get byClientId(): U128 {
        return this.client_id;
    }

    set byClientId(value: U128) {
        this.client_id = value;
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.eos_account);
        enc.pack(this.client_id);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.eos_account = obj;
        }
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.client_id = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.eos_account.getSize();
        size += this.client_id.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x3BA6932114D4F380);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
            new _chain.IDX128(code.N, scope.N, idxTableBase + 0, 0),
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return MixinAccount.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return MixinAccount.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.getPrimary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        switch (i) {
            case 0: {
                return _chain.newSecondaryValue_U128(this.byClientId);
                break;
            }
            default:
                _chain.assert(false, "bad db index!");
                return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
        }
    }

    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        switch (i) {
            case 0: {
                let _value = _chain.getSecondaryValue_U128(value);
                this.byClientId = _value;
                break;
            }
            default:
                _chain.assert(false, "bad db index!");
        }
    }


    static new(code: _chain.Name, scope: _chain.Name): MixinAccountDB {
        return new MixinAccountDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}

//table counters
// type Counter struct {
// 	id    uint64 //primary : t.id
// 	count uint64
// }


export class CounterDB extends _chain.MultiIndex<Counter> {

}

@table("counters", nocodegen)

export class Counter implements _chain.MultiIndexValue {
    
    constructor(
        public id: u64 = 0,
        public count: u64 = 0,
    ){}

    @primary
    get primary(): u64 {
        return this.id
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.id);
        enc.packNumber<u64>(this.count);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.id = dec.unpackNumber<u64>();
        this.count = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        size += sizeof<u64>();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x45353CAAF8000000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return Counter.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return Counter.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): CounterDB {
        return new CounterDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}



export class ProcessDB extends _chain.MultiIndex<Process> {

}

@table("processes", noabigen, nocodegen)

export class Process implements _chain.MultiIndexValue {
    
    constructor(
        public contract: Name = new Name(),
        public process: U128 = new U128(),
    ){}

    @primary
    get primary(): u64 {
        return this.contract.N
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.contract);
        enc.pack(this.process);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.contract = obj;
        }
        
        {
            let obj = new U128();
            dec.unpack(obj);
            this.process = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.contract.getSize();
        size += this.process.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xADE885630AC00000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return Process.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return Process.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): ProcessDB {
        return new ProcessDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}



export class PendingEventDB extends _chain.MultiIndex<PendingEvent> {
    get ByAccountDB(): _chain.IDX64 {
        return <_chain.IDX64>this.idxdbs[0];
    }
    get ByHashDB(): _chain.IDX256 {
        return <_chain.IDX256>this.idxdbs[1];
    }

    updateByAccount(idxIt: _chain.SecondaryIterator, value: u64, payer: Name): _chain.IDX64 {
    let secValue = _chain.newSecondaryValue_u64(value);
    this.idxUpdate(idxIt, secValue, payer);
    return <_chain.IDX64>this.idxdbs[0];
}
    updateByHash(idxIt: _chain.SecondaryIterator, value: U256, payer: Name): _chain.IDX256 {
    let secValue = _chain.newSecondaryValue_U256(value);
    this.idxUpdate(idxIt, secValue, payer);
    return <_chain.IDX256>this.idxdbs[1];
}
}

@table("pendingevts", nocodegen)

export class PendingEvent implements _chain.MultiIndexValue {
    
    constructor(
        public event:   TxEvent | null = null,
        public account: Name = new Name(),
        public hash:    U256 = new U256(),     
    ){
    }

    @primary
    get primary(): u64 {
        return this.event!.nonce;
    }

    @secondary
    get ByAccount(): u64 {
        return this.account.N;
    }

    set ByAccount(value: u64) {
        this.account.N = value;
    }

    @secondary
    get ByHash(): U256 {
        return this.hash;
    }

    set ByHash(value: U256) {
        this.hash = value;
    }


    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        
        if (!this.event) {
            _chain.check(false, "event can not be null");
        }
        enc.pack(this.event!);
        enc.pack(this.account);
        enc.pack(this.hash);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new TxEvent();
            dec.unpack(obj);
            this.event = obj;
        }
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.account = obj;
        }
        
        {
            let obj = new U256();
            dec.unpack(obj);
            this.hash = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        
        if (!this.event) {
            _chain.check(false, "event can not be null");
        }
        size += this.event!.getSize();
        size += this.account.getSize();
        size += this.hash.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xAAA6974D8ADE7000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
            new _chain.IDX64(code.N, scope.N, idxTableBase + 0, 0),
            new _chain.IDX256(code.N, scope.N, idxTableBase + 1, 1),
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return PendingEvent.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return PendingEvent.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        switch (i) {
            case 0: {
                return _chain.newSecondaryValue_u64(this.ByAccount);
                break;
            }
            case 1: {
                return _chain.newSecondaryValue_U256(this.ByHash);
                break;
            }
            default:
                _chain.assert(false, "bad db index!");
                return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
        }
    }

    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        switch (i) {
            case 0: {
                let _value = _chain.getSecondaryValue_u64(value);
                this.ByAccount = _value;
                break;
            }
            case 1: {
                let _value = _chain.getSecondaryValue_U256(value);
                this.ByHash = _value;
                break;
            }
            default:
                _chain.assert(false, "bad db index!");
        }
    }


    static new(code: _chain.Name, scope: _chain.Name): PendingEventDB {
        return new PendingEventDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}


//table submittedevs
// type SubmittedEvent struct {
// 	nonce uint64 //primary : t.nonce
// }



export class SubmittedEventDB extends _chain.MultiIndex<SubmittedEvent> {

}

@table("submittedevs", nocodegen)

export class SubmittedEvent implements _chain.MultiIndexValue {
    
    constructor(
        public nonce: u64 = 0
    ){}

    @primary
    get primary(): u64 {
        return this.nonce;
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u64>(this.nonce);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.nonce = dec.unpackNumber<u64>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += sizeof<u64>();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xC68F27672A4AB780);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return SubmittedEvent.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return SubmittedEvent.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): SubmittedEventDB {
        return new SubmittedEventDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}

//table errorevents
// type ErrorTxEvent struct {
// 	event       TxEvent //primary : t.event.nonce
// 	reason      string
// 	originExtra []byte
// }



export class ErrorTxEventDB extends _chain.MultiIndex<ErrorTxEvent> {

}

@table("errorevents", nocodegen)

export class ErrorTxEvent implements _chain.MultiIndexValue {
    
    constructor(
        public event: TxEvent = new TxEvent(),
        public reason: string = "",
        public origin_extra: u8[] = [],
    ){}

    @primary
    get primary(): u64 {
        return this.event.nonce
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.event);
        enc.packString(this.reason);
        enc.packNumberArray<u8>(this.origin_extra)
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new TxEvent();
            dec.unpack(obj);
            this.event = obj;
        }
        this.reason = dec.unpackString();
        this.origin_extra = dec.unpackNumberArray<u8>();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.event.getSize();
        size += _chain.Utils.calcPackedStringLength(this.reason);
        size += _chain.calcPackedVarUint32Length(this.origin_extra.length);size += sizeof<u8>()*this.origin_extra.length;
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x55EF4BAB6A9E7000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return ErrorTxEvent.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return ErrorTxEvent.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): ErrorTxEventDB {
        return new ErrorTxEventDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}



export class TransferFeeDB extends _chain.MultiIndex<TransferFee> {

}

@table("transferfees", nocodegen)

export class TransferFee implements _chain.MultiIndexValue {
    
    constructor(
        public fee: Asset = new Asset()
    ){}

    @primary
    get primary(): u64 {
        return this.fee.symbol.code();
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.fee);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Asset();
            dec.unpack(obj);
            this.fee = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.fee.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xCDCD3C2D575A9580);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return TransferFee.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return TransferFee.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): TransferFeeDB {
        return new TransferFeeDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}



export class TotalFeeDB extends _chain.MultiIndex<TotalFee> {

}

@table("totalfees", nocodegen)

export class TotalFee implements _chain.MultiIndexValue {
    
    constructor(
        public total: Asset = new Asset()
    ){}

    @primary
    get primary(): u64 {
        return this.total.symbol.code();
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.total);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Asset();
            dec.unpack(obj);
            this.total = obj;
        }
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.total.getSize();
        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0xCD3268AD4AC00000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indexes: _chain.IDXDB[] = [
        ];
        return indexes;
    }

    getTableName(): _chain.Name {
        return TotalFee.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return TotalFee.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name): TotalFeeDB {
        return new TotalFeeDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}