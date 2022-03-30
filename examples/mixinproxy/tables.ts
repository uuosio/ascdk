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

@table("signers")
export class Signer extends Table {
    account: u64;
    public_key!: PublicKey;

    @primary
    get getPrimary(): u64 {
        return this.account;
    }
}

@table("global", singleton)
export class global {
    constructor (
    public escrow_id: u64 = 0,
    ) {
    }
}

@table("txevents")
export class TxEvent extends Table {
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
}

@table("accountcache", singleton)
export class AccountCache {
    constructor(
        public id: u64 = 0,
        public account: Name = new Name(),
    ){

    }

    @primary
    get getPrimary(): u64 {
        return this.id
    }
}


//table mixinassets
// type MixinAsset struct {
// 	symbol   chain.Symbol  //primary : t.symbol.Code()
// 	asset_id chain.Uint128 //IDX128: ByAssetId : t.asset_id : t.asset_id
// }

@table("mixinassets")
export class MixinAsset {

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
}

//table createaccfee singleton
// type CreateAccountFee struct {
// 	fee chain.Asset
// }

@table("createaccfee", singleton)
export class CreateAccountFee {
    constructor(
        public fee: Asset = new Asset()
    ){}
}

@table("bindaccounts")
export class MixinAccount {
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
}

//table counters
// type Counter struct {
// 	id    uint64 //primary : t.id
// 	count uint64
// }
@table("counters")
export class Counter {
    constructor(
        public id: u64 = 0,
        public count: u64 = 0,
    ){}

    @primary
    get primary(): u64 {
        return this.id
    }
}

@table("processes", noabigen)
export class Process {
    constructor(
        public contract: Name = new Name(),
        public process: U128 = new U128(),
    ){}

    @primary
    get primary(): u64 {
        return this.contract.N
    }
}

@table("pendingevts")
export class PendingEvent {
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

}


//table submittedevs
// type SubmittedEvent struct {
// 	nonce uint64 //primary : t.nonce
// }

@table("submittedevs")
export class SubmittedEvent {
    constructor(
        public nonce: u64 = 0
    ){}

    @primary
    get primary(): u64 {
        return this.nonce;
    }
}

//table errorevents
// type ErrorTxEvent struct {
// 	event       TxEvent //primary : t.event.nonce
// 	reason      string
// 	originExtra []byte
// }

@table("errorevents")
export class ErrorTxEvent {
    constructor(
        public event: TxEvent = new TxEvent(),
        public reason: string = "",
        public origin_extra: u8[] = [],
    ){}

    @primary
    get primary(): u64 {
        return this.event.nonce
    }
}

@table("transferfees")
export class TransferFee {
    constructor(
        public fee: Asset = new Asset()
    ){}

    @primary
    get primary(): u64 {
        return this.fee.symbol.code();
    }
}

@table("totalfees")
export class TotalFee {
    constructor(
        public total: Asset = new Asset()
    ){}

    @primary
    get primary(): u64 {
        return this.total.symbol.code();
    }
}