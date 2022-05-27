import {
    Name,
    Action,
    PermissionLevel,

    Decoder,

    print
} from "as-chain"

import {
    NewAccount,
    Authority,
    PermissionLevelWeight,
    BuyRamBytes,
} from "./generated/structs"

const RAM_BYTES = u32(3 * 1024)

//abcdefghijklmnopqrstuvwxyz12345
const alphabet: u8[] = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 49, 50, 51, 52, 53];
const firstName :u8[] = [97, 97, 97, 97, 97, 97, 97, 97, 97];

export function GetAccountNameFromId(accountId: u64): Name {
    let strName = new Uint8Array(9);
    for (let i=0; i<9; i++) {
        strName[i] = firstName[i];
    }

    for (let i=0; i<9; i++) {
        let j = <i32>(accountId % 31);
        strName[i] = alphabet[j];
        accountId /= 31;
        if (accountId == 0) {
            break
        }
    }
    strName.reverse();
    return Name.fromString(String.UTF8.decode(strName.buffer) + "mvm");
}


export function createNewAccount(creatorName: Name, ownerAccountName: Name, newAccountName: Name): void {
    let newAccount = new NewAccount()
    newAccount.creator = creatorName;
    newAccount.name = newAccountName;

    newAccount.owner.threshold = 1
    newAccount.owner.accounts = [
        new PermissionLevelWeight(
            new PermissionLevel(ownerAccountName, Name.fromString("active")),
            1,
        ),
    ]

    newAccount.active.threshold = 1
    newAccount.active.accounts = [
        new PermissionLevelWeight(
            new PermissionLevel(ownerAccountName, Name.fromString("active")),
            1,
        )
    ];

    Action.new(
        [
            new PermissionLevel(creatorName, Name.fromString("active"))
        ],
        Name.fromString("eosio"),
        Name.fromString("newaccount"),
        newAccount
    ).send();

    Action.new(
        [
            new PermissionLevel(creatorName, Name.fromString("active"))
        ],
        Name.fromString("eosio"),
        Name.fromString("buyrambytes"),
        new BuyRamBytes(creatorName, newAccountName, RAM_BYTES)
    ).send()
}


@packer
class Operation {
    constructor(
        public purpose:  u16 = 0,
        public process:  u8[] = [],
        public platform: u8[] = [],
        public address:  u8[] = [],
        public extra:    u8[] = [], 
    ){}
}

function unpackU16(dec: Decoder): u16 {
    return (<u16>dec.unpackNumber<u8>()<<8) + <u16>dec.unpackNumber<u8>();
}

export function DecodeOperation(data: u8[]): Operation {
    let dec = new Decoder(data);
    let op = new Operation();
    op.purpose = unpackU16(dec);
    op.process = dec.unpackBytes(16);

    let length = unpackU16(dec);
    op.platform = dec.unpackBytes(length);

    length = unpackU16(dec);
    op.address = dec.unpackBytes(length);

    let extraLength = unpackU16(dec);
    op.extra = dec.unpackBytes(extraLength);
    return op;
}
