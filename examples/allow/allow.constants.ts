import { ActionWrapper, Name, packer, Table } from "as-chain"

// Contract
export const allow = Name.fromString("allow")

// Tables
export const paused = Name.fromString("paused")
export const allowed = Name.fromString("allowed")

// Actions
export const setpaused = new ActionWrapper(Name.fromString("setpaused"))
export const setallowed = new ActionWrapper(Name.fromString("setallowed"))
export const setblocked = new ActionWrapper(Name.fromString("setblocked"))

// Include
@packer
class constants extends Table { constructor() { super(); } }