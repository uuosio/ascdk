import {
    Contract,
    Name,
    PermissionLevel,
    Action,
    Transaction,
    U128,
    print,
    printHex,
    Utils,
    check,
    Asset,
    Symbol,
    Encoder
} from "asm-chain";

@packer
class Transfer {
    constructor(
        public from: Name,
        public to: Name,
        public quantity: Asset,
        public memo: string
    ){}
}

@contract
class MyContract extends Contract{

    @action("sayhello")
    sayHello(name: string): void {
        print(`hello ${name}`);
    }

    @action("testtx")
    testTx(): void {
        let transfer = new Transfer(
            this.receiver,
            Name.fromString("eosio"),
            new Asset(10000, new Symbol("EOS", 4)),
            "tranfer to eosio",
        );

        let t = new Transaction(1);
        let action = Action.new(
            Name.fromString("eosio.token"),
            Name.fromString("transfer"),
            new PermissionLevel(this.receiver),
            transfer,
        );
        t.addAction(action);

        let packedTx1 = Encoder.pack(t);
        t.unpack(packedTx1);
        let packedTx2 = Encoder.pack(t);
        check(Utils.bytesCmp(packedTx1, packedTx2) == 0, "bad value");
        printHex(packedTx1);
        t.send(new U128(1), true, this.receiver);
        print("Done!");
    }
}
