import { ActionWrapper, Name, packer, Table } from "as-chain"

// Contract
export const avatar = Name.fromString("avatar")

// Tables
export const avatars = Name.fromString("avatars")

// Actions
export const updatevalues = new ActionWrapper(Name.fromString("updatevalues"))
export const removekeys = new ActionWrapper(Name.fromString("removekeys"))

// Include
@packer
class avatar_contants extends Table { constructor() { super(); } }