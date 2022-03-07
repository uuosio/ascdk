import { packer, Name, Asset, Table } from "as-chain"

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