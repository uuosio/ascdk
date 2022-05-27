import { Name, Table } from "as-chain"

// Contract
export const balance = Name.fromString("balance")

// Tables
export const accounts = Name.fromString("accounts")
export const global = Name.fromString("global")

// External
export const atomicassets = Name.fromString("atomicassets");

// Include
@packer
class constants extends Table { constructor() { super(); } }