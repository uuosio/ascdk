import { Name, Table } from "as-chain"

// Contract
export const escrow = Name.fromString("escrow")

// Tables
export const escrows = Name.fromString("escrows")
export const accounts = Name.fromString("escraccounts")
export const globall = Name.fromString("globall")

// Notifications
export const transfer = Name.fromString("transfer")

// External
export const atomicassets = Name.fromString("atomicassets");


// Status
export namespace ESCROW_STATUS {
    export const START = 'start';
    export const FILL = 'fill';
    export const CANCEL = 'cancel';
}
export type ESCROW_STATUS = string;

// Include
@packer
class empty extends Table { constructor() { super(); } }