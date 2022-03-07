import { packer, Name, Asset, Table, ActionWrapper, ExtendedAsset, PermissionLevel } from "as-chain"
import { atomicassets } from "./constants";

@packer
export class TokenTransfer extends Table {
    constructor (
        public from: Name = new Name(),
        public to: Name = new Name(),
        public quantity: Asset = new Asset(),
        public memo: string = "",
    ) {
        super();
    }
}

@packer
export class NftTransfer extends Table {
    constructor (
        public from: Name = new Name(),
        public to: Name = new Name(),
        public asset_ids: u64[] = [],
        public memo: string = "",
    ) {
        super();
    }
}

const transferAW: ActionWrapper = new ActionWrapper("transfer");

export function transfer_tokens(from: Name, to: Name, tokens: ExtendedAsset[], memo: string): void {
    for (let i = 0; i < tokens.length; i++) {
        const action = transferAW.act(tokens[i].contract, new PermissionLevel(from))
        const actionParams = new TokenTransfer(from, to, tokens[i].quantity, memo)
        action.send(actionParams)
    }
}

export function transfer_nfts(from: Name, to: Name, nfts: u64[], memo: string): void {
    for (let i = 0; i < nfts.length; i++) {
        const action = transferAW.act(atomicassets, new PermissionLevel(from))
        const actionParams = new NftTransfer(from, to, nfts, memo)
        action.send(actionParams)
    }
}
