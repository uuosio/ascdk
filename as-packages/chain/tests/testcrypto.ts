import {
    Asset,
    Signature,
    PublicKey,
    Checksum256,
    recoverKey,
    assertRecoverKey,
    assertSha256,
    assertSha1,
    assertSha512,
    assertRipemd160,
    sha256,
    sha1,
    sha512,
    ripemd160,
    print,
    check,
    Contract,
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

@contract
class MyContract extends Contract {
    @action("test")
    Test(message: string, digest: Checksum256, sig: Signature, pub: PublicKey): void {
        // message:'hello,world'
        // 'digest': '77df263f49123356d28a4a8715d25bf5b980beeeb503cab46ea61ac9f3320eda',
        // 'sig': 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH',
        // 'pub': 'EOS87J9kj21dvniKhqd7A7QPXRz498ek3H3doXoQVPf4VnHHNtt1M',
        assertRecoverKey(digest, sig, pub);
        let _pub = recoverKey(digest, sig);
        check(pub == _pub, "invalid public key");
        print(`Done!`);

        let data: u8[] = [1, 2, 3, 4, 5, 6];
        {
            let hash = sha256(data);    
            assertSha256(data, hash);
        }

        {
            let hash = sha1(data);  
            assertSha1(data, hash);
        }

        {
            let hash = sha512(data);     
            assertSha512(data, hash);
        }

        {
            let hash = ripemd160(data);     
            assertRipemd160(data, hash);
        }
    }
}
