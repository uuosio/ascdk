import {
    Name,
    Asset,
    packer,
    contract,
    action,
    Signature,
    PublicKey,
    RecoverKey,
    AssertRecoverKey,
    Checksum256,
    print,
    check,
} from "as-chain";

@packer
class MyData {
    constructor(public a: u64 = 0,
        public b: u64 = 0,
        public c: u64 = 0,
        public d: Asset[] = [],
    ) {
    }
}

@packer
class TestClass<T extends u32> {
    data!: Array<u8>;
}

@contract("hello")
class MyContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("test")
    Test(message: string, digest: Checksum256, sig: Signature, pub: PublicKey): void {
        // message:'hello,world'
        // 'digest': '77df263f49123356d28a4a8715d25bf5b980beeeb503cab46ea61ac9f3320eda',
        // 'sig': 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH',
        // 'pub': 'EOS87J9kj21dvniKhqd7A7QPXRz498ek3H3doXoQVPf4VnHHNtt1M',
        AssertRecoverKey(digest, sig, pub);
        let _pub = RecoverKey(digest, sig);
        check(pub == _pub, "invalid public key");
        print(`Done!`)
    }
}
