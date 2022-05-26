import { Name, Table } from "as-chain"

// Contract
export const token = Name.fromString("token")

// Tables
export const stat = Name.fromString("stat")
export const accounts = Name.fromString("accounts")

// Include
@packer
class empty extends Table { constructor() { super(); } }