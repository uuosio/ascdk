import { check, ExtendedAsset, packer, Table } from "as-chain"
import { Account } from "./balance.tables";

/**
 * FIND INDEXES
 */
export function findIndexOfU64 (array: u64[], item: u64): i32 {
    let itemIndex = -1
    for (let j = 0; j < array.length; j++) {
        if (array[j] == item) {
            itemIndex = j
            break;
        }
    }
    return itemIndex
}

export function findIndexOfExtendedAsset (tokens: ExtendedAsset[], token: ExtendedAsset): i32 {
    let tokenIndex = -1
    for (let j = 0; j < tokens.length; j++) {
        if (tokens[j].getExtendedSymbol() == token.getExtendedSymbol()) {
            tokenIndex = j
            break;
        }
    }
    return tokenIndex
}

export function findAndRemoveItemsFromArray (array: u64[], itemsToRemove: u64[]): void {
    for (let i = 0; i < itemsToRemove.length; i++) {
        const indexOfItemToRemove = findIndexOfU64(array, itemsToRemove[i])
        check(indexOfItemToRemove != -1, "item not found in array")
        array.splice(i, 1)
    }
}

/**
 * Substract NFT
 */
export function substractNfts(account: Account, subNfts: u64[]): void {
    findAndRemoveItemsFromArray(account.nfts, subNfts);
}

/**
 * Add NFTs
 */
export function addNfts(account: Account, addNfts: u64[]): void {
    account.nfts = account.nfts.concat(addNfts)
}

/**
 * Substract Token
 */

export function substractToken (tokens: ExtendedAsset[], sub: ExtendedAsset): void {
    // Validation
    check(sub.quantity.isValid(), "valid quantity");
    check(sub.quantity.amount > 0, "sub quantity must be positive");
    
    // Find index of token
    const tokenIndex = findIndexOfExtendedAsset(tokens, sub)
    check(tokenIndex != -1, "no balance found for user to reduce balance")

    // Substract Balance
    const currentBalance = tokens[tokenIndex]
    check(currentBalance >= sub, "user balance too low")
    tokens[tokenIndex] = ExtendedAsset.sub(tokens[tokenIndex], sub)

    // Delete if zero
    if (tokens[tokenIndex].quantity.amount == 0) {
        tokens.splice(tokenIndex, 1)
    }
}

export function substractTokens(account: Account, subTokens: ExtendedAsset[]):  void {
    for (let i = 0; i < subTokens.length; i++) {
        substractToken(account.tokens, subTokens[i])
    } 
}

/**
 * ADD
 */
export function addToken(tokens: ExtendedAsset[], add: ExtendedAsset): void {
    // Validation
    check(add.quantity.isValid(), "valid quantity");
    check(add.quantity.amount > 0, "add quantity must be positive");
    
    // Find index of token
    const tokenIndex = findIndexOfExtendedAsset(tokens, add)

    // If token does not exist, add it
    if (tokenIndex == -1) {
        tokens.push(add)
    }
    // If token exists, update balance
    else {
        tokens[tokenIndex] = ExtendedAsset.add(tokens[tokenIndex], add)
    }
}

export function addTokens(account: Account, subTokens: ExtendedAsset[]): void {
    for (let i = 0; i < subTokens.length; i++) {
        addToken(account.tokens, subTokens[i])
    } 
}

// Operations
export namespace OPERATION {
    export const ADD = 'add';
    export const SUB = 'sub';
}
export type OPERATION = string;

// Include
@packer
class utils extends Table { constructor() { super(); } }