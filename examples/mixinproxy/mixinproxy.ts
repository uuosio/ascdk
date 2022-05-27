import {
    Contract,
    U128,
    U256,
    sha256,
    recoverKey,

    readActionData,
    Decoder,
    print,
    Name,
    Symbol,
    Asset,
    check,
    Checksum256,
    Action,
    PermissionLevel,
    requireAuth,
    currentTimeSec,
    currentTimeMs,
    assertSha256,
    Utils,
} from "as-chain";

import {
    GetAccountNameFromId,
    createNewAccount,
    DecodeOperation,
} from "./utils"

import {
    Signer,
    TxEvent,
    AccountCache,
    MixinAsset,
    CreateAccountFee,
    MixinAccount,
    Counter,
    Process,
    PendingEvent,
    SubmittedEvent,
    ErrorTxEvent,
    TotalFee,
    TransferFee,    
} from "./generated/tables"

import {
    Create,
    Issue,
    Transfer,

    currency_stats,
    MIXIN_WTOKENS,
    MAX_SUPPLY,
} from "./token"

import {
    TxRequest,
    ErrorMessage
} from "./generated/structs";

const MTG_XIN: Name       = Name.fromString("mtgxinmtgxin")

const MTG_WORK_EXPIRATION_SECONDS: u32 = 3 * 60;

const KEY_NONCE: u64         = 1
const KEY_TX_REQUEST_INDEX: u64 = 2;

@contract
class MyContract extends Contract{
    process: U128
    constructor(
        receiver: Name,
        firstReceiver: Name,
        action: Name
    ) {
        super(receiver, firstReceiver, action);
        let db = Process.new(MTG_XIN, MTG_XIN);
        let process = db.getByKey(this.receiver.N);
        check(process != null, "process not found");
        this.process = process!.process;
    }

    @action("initialize")
    Initialize(): void {
        requireAuth(this.receiver);
        let db = AccountCache.new(this.receiver, this.receiver);
        let item = db.getOrNull();
        check(item == null, "account cache has already been initialzied");
        item = new AccountCache();
        item.account = Name.fromString("aaaaaaaaamvm");
        db.set(item, this.receiver);
        createNewAccount(this.receiver, this.receiver, item.account);
    }

    @action("onevent", ignore)
    OnEvent(event: TxEvent | null, origin_extra: u8[] | null): void {
        let data = readActionData();
        let dec = new Decoder(data);
        event = new TxEvent();

        let size = dec.unpack(event);
        size = size - 1 - event.signatures.length * 66
        let ret = this.verifySignatures(data.slice(0, <i32>size), event);
        check(ret, "not enough signature!");

        check(event.process == this.process, "invalid process!")

        this.checkNonce(event.nonce);

        this.checkFee(event);

        origin_extra = dec.unpackNumberArray<u8>();
        this.handleEvent(event, origin_extra);
    }

    @action("onerrorevent", ignore)
    onErrorEvent(event: TxEvent | null, reason: string | null, origin_extra: u8[] | null): void {
        let data = readActionData();
        let dec = new Decoder(data);
        let errorEvent = new ErrorTxEvent();
        let size = dec.unpack(errorEvent.event);
        event = errorEvent.event;
        let dataSize = size - 1 - event.signatures.length * 66;
        this.verifySignatures(data.slice(0, <i32>dataSize), errorEvent.event);
        check(event.process == this.process, "Invalid process id");

        errorEvent.reason = dec.unpackString();
        errorEvent.origin_extra = dec.unpackNumberArray<u8>();

        let nonce = this.getNonce();
        check(event.nonce >= nonce, "bad nonce!");
        this.storeNonce(event.nonce);
        this.checkFee(event);

        if (event.amount > new U128(MAX_SUPPLY)) {
            this.showError("amount too large");
        }

        if (this.handleExpiration(event)) {
            return;
        }

        let db = ErrorTxEvent.new(this.receiver, this.receiver);
        let it = db.find(event.nonce);
        check(!it.isOk(), "error event already exists!");
        db.store(errorEvent, this.receiver);
    }

    @action("setfee")
    setTransferFee(fee: Asset): void {
        requireAuth(this.receiver);
        {
            let db = MixinAsset.new(this.receiver, this.receiver);
            let it = db.find(fee.symbol.code());
            check(it.isOk(), "asset not found!");
        }

        {
            let db = TransferFee.new(this.receiver, this.receiver);
            let it = db.find(fee.symbol.code());
            let record = new TransferFee(fee);
            if (it.isOk()) {
                db.update(it, record, new Name());
            } else {
                db.store(record, this.receiver);
            }
        }
    }

    @action("error")
    onError(err: string): void {}

    storeNonce(eventNonce: u64): void {
        let db = SubmittedEvent.new(this.receiver, this.receiver);
        let it = db.find(eventNonce);
        check(!it.isOk(), "event already exists!");
        db.store(new SubmittedEvent(eventNonce), this.receiver);
    }

    checkNonce(eventNonce: u64): void {
        let nonce = this.getNonce();
        check(eventNonce >= nonce, "bad nonce!");
        let db = SubmittedEvent.new(this.receiver, this.receiver);
        let it = db.find(eventNonce);
        check(!it.isOk(), "event already exists!");
        db.store(new SubmittedEvent(eventNonce), this.receiver);
        while (true) {
            let it = db.find(nonce);
            if (!it.isOk()) {
                break;
            }
            db.remove(it);
            this.incNonce();
            nonce += 1;
        }

        while (true) {
            let it = db.lowerBound(0);
            if (!it.isOk()) {
                break;
            }
            let record = db.get(it);
            if (record.nonce > nonce) {
                break;
            }
            db.remove(it);
        }
    }

    getNonce(): u64 {
        let db = Counter.new(this.receiver, this.receiver);
        let item = db.getByKey(KEY_NONCE);
        if (item) {
            return item.count; 
        }
        //nonce starts from 1, event with nonce 0 is for addprocess which sends to mtg.xin contract
        item = new Counter(KEY_NONCE, 1);
        db.store(item, this.receiver);
        return 1;
    }

    incNonce(): void {
        let db = Counter.new(this.receiver, this.receiver);
        let it = db.find(KEY_NONCE);
        if (it.isOk()) {
            let item = db.get(it);
            item.count += 1;
            db.update(it, item, new Name());
        } else {
            let item = new Counter(KEY_NONCE, 2);
            db.store(item, this.receiver);
        }
    }

    handleEvent(event: TxEvent, origin_extra: u8[]): void {
        if (event.members.length != 1) {
            this.showError("multisig event not supported currently");
            return;
        }

        if (event.amount > new U128(MAX_SUPPLY)) {
            this.showError("amount too large");
            return;
        }

        if (this.handleExpiration(event)) {
            return;
        }

        let clientId = event.members[0];
        let db = MixinAccount.new(this.receiver, this.receiver);
        let itIdx = db.byClientIdDB.find(clientId);
        if (!itIdx.isOk()) {
            let fee = CreateAccountFee.new(this.receiver, this.receiver).get();
            let symbol = this.getSymbol(event.asset);

            if (symbol != new Symbol("MEOS", 8)) {
                return;
            }

            if (event.amount < new U128(u64(fee.fee.amount))) {
                return;
            }

            this.createNewAccount(clientId);
            return;
        }
        let item = db.getByKey(itIdx.primary)!;
        let account = item.eos_account;
        if (origin_extra.length == 0) {
            if (this.storePendingEvent(account, event)) {
                return;
            }
        }
        this.handleEventWithExtra(account, event, origin_extra);
    }

    storePendingEvent(account: Name, event: TxEvent): bool {
        let db = PendingEvent.new(this.receiver, this.receiver);
        if (event.extra.length < 1 + 32) {
            return false;
        }

        if (event.extra[0] != 1) {
            return false;
        }

        let hash = new U256();
        hash.unpack(event.extra.slice(1, 33));
        db.store(new PendingEvent(event, account, hash), this.receiver);
        return true;
    }

    handleExpiration(event: TxEvent): bool {
        let expiration = u32(event.timestamp/1000000000) + MTG_WORK_EXPIRATION_SECONDS
        if (expiration > currentTimeSec()) {
            return false;
        }
        this.refund(event, "event expired");
        return true;
    }

    getSymbol(assetId: U128): Symbol {
        let db = MixinAsset.new(this.receiver, this.receiver);
        let it = db.byAssetIdDB.find(assetId);
        if (!it.isOk()) {
            return new Symbol();
        }
        let item = db.getByKey(it.primary);
        if (item) {
            return item.symbol;
        }
        return new Symbol();
    }

    showError(err: string): void {
        let msg = new ErrorMessage(err);
        Action.new([new PermissionLevel(this.receiver, Name.fromString("active"))],
            this.receiver,
            Name.fromString("error"),
            msg
        ).send();
    }

    handleEventWithExtra(fromAccount: Name, event: TxEvent, origin_extra: u8[]): void {
        let symbol = this.getSymbol(event.asset)
        if (symbol.raw() == 0) {
            return;
        }

        let action: Action | null = null;
        if (origin_extra.length == 0) {
            if (event.extra.length > 0) {
                if (event.extra[0] != 0) {
                    this.showError("bad extra type");
                }

                let extra = event.extra.slice(1);
                action = this.parseAction(extra);
                if (action == null) {
                    this.showError("invalid action data, refund!");
                }
            }
        } else {
            check(event.extra.length >= 33, "bad extra");
            check(event.extra[0] == 1, "not an extended extra type");
            let checksum = new Checksum256(event.extra.slice(1, 33));
            assertSha256(origin_extra, checksum);
            let op = DecodeOperation(origin_extra);
            check(op.extra[0] == 0, "invalid extra type");
            action = this.parseAction(op.extra.slice(1));
            if (!action) {
                this.refund(event, "invalid action data, refund!")
            }
        }

        let asset = new Asset(i64(event.amount.lo), symbol);
        this.issueAsset(fromAccount, asset, event.timestamp);        
        if (action) {
            this.sendAction(fromAccount, action);
        }
    }

    sendAction(fromAccount: Name, action: Action): void {
        action.authorization = [
            new PermissionLevel(fromAccount, Name.fromString("active"))
        ];
        action.send();
    }

    parseAction(extra: u8[]): Action | null {
        if (extra.length < 16) {
            return null;
        }
        let account = new Name();
        account.N = load<u64>(extra.dataStart);
        let name = new Name();
        name.N = load<u64>(extra.slice(8, 16).dataStart);
        return new Action([], account, name, extra.slice(16));
    }

    @action("exec")
    exec(executor: Name): void {
        requireAuth(executor);
        {
            let db = PendingEvent.new(this.receiver, this.receiver);
            let it = db.lowerBound(0);
            if (it.isOk()) {
                let item = db.get(it);
                if (this.handleExpiration(item.event!)) {
                    db.remove(it);
                    return;
                }
            }
        }

        {
            let db = ErrorTxEvent.new(this.receiver, this.receiver);
            let it = db.lowerBound(0);
            check(it.isOk(), "error event not found!");
            let record = db.get(it);
            db.remove(it);
            this.handleEvent(record.event, record.origin_extra);
        }
    }
    @action("execpending")
    execPendingEventByExtra(executor: Name, nonce: u64, origin_extra: u8[]): void {
        requireAuth(executor);
        check(origin_extra.length > 0, "origin_extra should not be empty");

        let db = PendingEvent.new(this.receiver, this.receiver);
        let it = db.find(nonce);
        check (it.isOk(), "pending event not found");
        let record = db.get(it);
        db.remove(it);
        this.handleEvent(record.event!, origin_extra);
    }

    verifySignatures(data: u8[], event: TxEvent): bool {
        let digest = sha256(data);
        let signers: Array<Signer> = new Array<Signer>();
        let mtgContract = Name.fromString("mtgxinmtgxin");
        let db = Signer.new(mtgContract, mtgContract);
        let it = db.lowerBound(0)
        while (it.isOk()) {
            let signer = db.get(it);
            signers.push(signer);
            it = db.next(it);
        }

        let validSignerCount = 0;
        let threshold = signers.length * 2 / 3 + 1;
        for (let i=0; i<event.signatures.length; i++) {
            let pubKey = recoverKey(digest, event.signatures[i]);
            for (let i=0; i<signers.length; i++) {
                if (signers[i].public_key == pubKey) {
                    validSignerCount += 1;
                    if (validSignerCount >= threshold) {
                        return true;
                    }
                    break;
                }
            }
        }
        return false;
    }

    getNextAvailableAccount(): Name {
        let db = AccountCache.new(this.receiver, this.firstReceiver);
        let item = db.get();
        check(item != null, "account not found!");
        if (item == null) {
            item = new AccountCache();
        }

        let account = item.account;
        item.id += 1;
        item.account = GetAccountNameFromId(item.id)
        db.set(item, this.receiver);
        createNewAccount(this.receiver, this.receiver, item.account);
        return account;
    }

    @action("addasset")
    addMixinAsset(asset_id: U128, symbol: Symbol): void {
        requireAuth(this.receiver);
        let db = MixinAsset.new(this.receiver, this.receiver);
        let it = db.find(symbol.code());
        check(!it.isOk(), "Asset has already been added");
        let asset = new MixinAsset(symbol, asset_id);
        db.store(asset, this.receiver);
    }

    @action("removeasset")
    removeMixinAsset(symbol: Symbol): void {
        requireAuth(this.receiver);
        let db = MixinAsset.new(this.receiver, this.receiver);
        let it = db.find(symbol.code());
        check(it.isOk(), "asset does not exists!");
        db.remove(it);
    }

    @action("setaccfee")
    setCreateAccountFee(fee: Asset): void {
        requireAuth(this.receiver);
        check(fee.amount > 0, "fee must be greater than 0");
        let db = CreateAccountFee.new(this.receiver, this.receiver);
        db.set(new CreateAccountFee(fee), this.receiver);
    }

    @action("ontransfer")
    onTransfer(from: Name, to: Name, quantity: Asset, memo: string): void {
        requireAuth(MIXIN_WTOKENS);
        if (from == this.receiver) {
            return;
        }
        let db = MixinAccount.new(this.receiver, this.receiver);
        let account = db.getByKey(to.N);
        if (!account) {
            return;
        }

        let assets = MixinAsset.new(this.receiver, this.receiver);
        let asset = assets.getByKey(quantity.symbol.code());
        if (!asset) {
            return;
        }

        let extra = Utils.stringToU8Array(memo).slice(0, 128);
        let nonce = this.getNextTxRequestNonce();
        let request = new TxRequest(
            nonce,
            this.receiver,
            this.process,
            asset.asset_id,
            [account.client_id],
            1,
            new U128(quantity.amount),
            extra,
            currentTimeMs()*3000
        );

        Action.new(
            [new PermissionLevel(this.receiver, Name.fromString("active"))],
            MTG_XIN,
            Name.fromString("txrequest"),
            request,
        ).send();
    }

    createNewAccount(clientId: U128): Name {
        let db = MixinAccount.new(this.receiver, this.receiver);
        let it = db.byClientIdDB.find(clientId);
        check(!it.isOk(), "account already exists!");
        let account = this.getNextAvailableAccount();
        let record = new MixinAccount(account, clientId);
        db.store(record, this.receiver);
        return account;
    }

    issueAsset(fromAccount: Name, quantity: Asset, timestamp: u64): bool {
        let db = currency_stats.new(MIXIN_WTOKENS, new Name(quantity.symbol.code()));
        if (!db.find(quantity.symbol.code()).isOk()) {
            let create = new Create(this.receiver, new Asset(MAX_SUPPLY, quantity.symbol));
            create.send(MIXIN_WTOKENS);
        }

        let issue = new Issue(this.receiver, quantity, "issue");
        issue.send(this.receiver);

        let transfer = new Transfer(this.receiver, fromAccount, quantity, "transfer");
        transfer.send(this.receiver);
        return true;
    }

    refund(event: TxEvent, memo: string): void {
        let id = this.getNextTxRequestNonce();
        let notify = new TxRequest(
            id,
            this.receiver,
            this.process,
            event.asset,
            event.members,
            event.threshold,
            event.amount,
            Utils.stringToU8Array(memo), //String.UTF8.encode(memo).dataStart,
        );

        Action.new(
            [new PermissionLevel(this.receiver, Name.fromString("active"))],
            MTG_XIN,
            Name.fromString("txrequest"),
            notify,
        ).send();
    }

    getNextIndex(key: u64, initialValue: u64): u64 {
        let db = Counter.new(this.receiver, this.receiver);
        let it = db.find(key);
        if (!it.isOk()) {
            let item = new Counter(key, initialValue);
            db.store(item, this.receiver);
            return initialValue;
        } else {
            let item = db.get(it);
            item.count += 1;
            db.update(it, item, new Name());
            return item.count;
        }
    }

    getMixinAssetId(sym: Symbol): U128 {
        let db = MixinAsset.new(this.receiver, this.receiver);
        let item = db.getByKey(sym.code());
        if (item) {
            return item.asset_id;
        }
        return new U128();
    }

    checkFee(event: TxEvent): bool {
        let sym = this.getSymbol(event.asset);
        if (sym.raw() == 0) {
            return false;
        }
        let fee = this.getTransferFee(sym);
        this.addFee(fee);
        event.amount = U128.sub(event.amount, new U128(fee.amount));
        return true;
    }
    
    getTransferFee(sym: Symbol): Asset {
        let db = TransferFee.new(this.receiver, this.receiver);
        let fee = db.getByKey(sym.code());
        if (fee) {
            return fee.fee;
        }
        return new Asset(0, sym);
    }

    addFee(asset: Asset): void {
        let db = TotalFee.new(this.receiver, this.receiver);
        let it = db.find(asset.symbol.code())
        if (it.isOk()) {
            let record = db.get(it);
            record.total += asset;
            db.update(it, record, new Name());
        } else {
            db.store(new TotalFee(asset), this.receiver);
        }
    }

    getNextTxRequestNonce(): u64 {
        return this.getNextIndex(KEY_TX_REQUEST_INDEX, 1);
    }
}
