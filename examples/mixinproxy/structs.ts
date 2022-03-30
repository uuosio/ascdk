import {
    Name,
    PublicKey,
    PermissionLevel,
    U128,
} from "as-chain"

@packer
class KeyWeight {
    constructor(
        public key: PublicKey = new PublicKey(),
        public weight: u16 = 0
    ){

    }
}

@packer
export class PermissionLevelWeight {
    constructor(
        public permission: PermissionLevel = new PermissionLevel(),
        public weight: u16 = 0
    ){

    }
}

@packer
export class WaitWeight {
	waitSec: u16
	weight:  u16
}

@packer
export class Authority {
    constructor(
        public threshold: u32 = 0,
        public keys: KeyWeight[] = new Array<KeyWeight>(),
        public accounts: PermissionLevelWeight[] = new Array<PermissionLevelWeight>(),
        public waits: WaitWeight[] = new Array<WaitWeight>()
        ) {
    }
}

@packer
export class NewAccount {
    constructor(
        public creator: Name = new Name(),
        public name: Name = new Name(),
        public owner: Authority = new Authority(),
        public active: Authority = new Authority(),
    ){}
}

@packer
export class BuyRamBytes {
    constructor(
        public creator: Name = new Name(),
        public newAccount: Name = new Name(),
        public ramBytes: u32 = 0,
    ){}
}

//packer
// type TxRequest struct {
// 	nonce     uint64 //primary : t.nonce
// 	contract  chain.Name
// 	process   chain.Uint128
// 	asset     chain.Uint128
// 	members   []chain.Uint128
// 	threshold int32
// 	amount    chain.Uint128
// 	extra     []byte
// 	timestamp uint64
// }

@packer
export class TxRequest {
    constructor(
        public nonce:     u64 = 0,
        public contract:  Name = new Name(),
        public process:   U128 = new U128(0),
        public asset:     U128 = new U128(0),
        public members:   U128[] = [],
        public threshold: i32 = 0,
        public amount:    U128 = new U128(0),
        public extra:     u8[] = [],
        public timestamp: u64 = 0
    ){}
}


@packer
export class ErrorMessage {
    constructor(
        public err: string = ""
    ){}
}
