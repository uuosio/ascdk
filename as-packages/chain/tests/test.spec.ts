import { ChainTester } from "chaintester"
import { BigNumber } from 'bignumber.js';

it('test name', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testname.wasm", "target/testname.abi");
        ret = await tester.pushAction("hello", "test", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test serializer', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testserializer.wasm", "target/testserializer.abi");
        ret = await tester.pushAction("hello", "test1", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();

        let args = {
            a1: true,
            a2: 2,
            a3: 3,
            a4: 0xff01,
            a5: 0xff02,
            a6: 0xffffff00,
            a7: 0xffffff01,
            a8: new BigNumber("9223372032559808513"), //"0x7fffffff00000001", //i64
            a9: new BigNumber("18446744069414584322"), //"0xffffffff00000002",
            a10: -1,
            a11: "0xffffffffffffffffffffffffffffffff",
            a13: 0xfff, //VarUint32,
            a14: 0xffffff01,
            a15: new BigNumber("11.2233"), //"0xfffffffffffffff0", //double
            // a16: f128,
            a17: '2021-09-03T04:13:21', // chain.TimePoint,
            a18: '2021-09-03T04:13:21', // chain.TimePointSec,
            // a19: BlockTimestampType,
            a20: 'alice',
            // a21: u8[],
            a22: 'hello,world',
            a23: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb', // Checksum160,
            a24: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb', //Checksum256,
            a25: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb', //: Checksum512,
            a26: 'PUB_K1_11DsZ6Lyr1aXpm9aBqqgV4iFJpNbSw5eE9LLTwNAxqjJgXSdB8', //PublicKey,
            a27: 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH', //chain.Signature,
            a28: '4,EOS', //Symbol
            a29: 'EOS', //SymbolCode,
            a30: '0.1000 EOS',
            a31: ['0.1000 EOS', 'eosio.token'],
            a32: ['helloo', 'worldd'],    
        }

        ret = await tester.pushAction("hello", "test2", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test action', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testaction.wasm", "target/testaction.abi");

        let updateauth_args = {
            "account": "hello",
            "permission": "active",
            "parent": "owner",
            "auth": {
                "threshold": 1,
                "keys": [
                    {
                        "key": "EOS6AjF6hvF7GSuSd4sCgfPKq5uWaXvGM2aQtEUCwmEHygQaqxBSV",
                        "weight": 1
                    }
                ],
                "accounts": [{"permission":{"actor": "hello", "permission": "eosio.code"}, "weight":1}],
                "waits": []
            }
        };

        ret = await tester.pushAction("eosio", "updateauth", updateauth_args, {"hello": "active"});
        await tester.produceBlock();

        ret = await tester.pushAction("hello", "sayhello", {name: "bob"}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
        await tester.produceBlock();

        let args = {
                a1: 'hello',
                a2: '1.0000 EOS',
                a3: 12345,
                a4: [1, 2, 3],
                a5: ['1.0001 EOS', '2.0002 EOS'],
        };
        ret = await tester.pushAction("hello", "testgencode", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test multi-index', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testmi.wasm", "target/testmi.abi");
        ret = await tester.pushAction("hello", "testmi2", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }

    tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testmi.wasm", "target/testmi.abi");
        ret = await tester.pushAction("hello", "testend", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
        await tester.produceBlock();

        ret = await tester.pushAction("hello", "testend", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test asset', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testasset.wasm", "target/testasset.abi");
        ret = await tester.pushAction("hello", "test1", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test public key', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testpublickey.wasm", "target/testpublickey.abi");
        let args = {
            k1: 'PUB_K1_11DsZ6Lyr1aXpm9aBqqgV4iFJpNbSw5eE9LLTwNAxqjJgXSdB8',
            r1: 'PUB_R1_6FPFZqw5ahYrR9jD96yDbbDNTdKtNqRbze6oTDLntrsANgQKZu',
            webAuthN: 'PUB_WA_8PPYTWYNkRqrveNAoX7PJWDtSqDUp3c29QGBfr6MD9EaLocaPBmsk5QAHWq4vEQt2',
        }
        ret = await tester.pushAction("hello", "testpub", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test crypto', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testcrypto.wasm", "target/testcrypto.abi");
        let args = {
            'message': 'hello,world',
            'digest': '77df263f49123356d28a4a8715d25bf5b980beeeb503cab46ea61ac9f3320eda',
            'sig': 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH',
            'pub': 'EOS87J9kj21dvniKhqd7A7QPXRz498ek3H3doXoQVPf4VnHHNtt1M',
        }
        ret = await tester.pushAction("hello", "test", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

// #test system
// {
//     'test_name': 'testsystem',
//     'action': {
//         'account': 'hello',
//         'name': 'test',
//         'args': dict(
//             a1 = '2021-09-03T04:13:21', # chain.TimePoint,
//             a2 = '2021-09-03T04:13:21', # chain.TimePointSec,
//         ),
//         'permissions': None,
//     },
//     'err_msg': None,
// },


it('test system', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testsystem.wasm", "target/testsystem.abi");
        let args = {
            a1: '2021-09-03T04:13:21', // chain.TimePoint,
            a2: '2021-09-03T04:13:21', // chain.TimePointSec,
        }
        ret = await tester.pushAction("hello", "test", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test print', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testprint.wasm", "target/testprint.abi");
        let args = {
            a1: '0x7fffffffffffffffffffffffffffffff',
        }
        ret = await tester.pushAction("hello", "test", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test transaction', async () => {
    let tester = new ChainTester();
    await tester.init();
    let updateauth_args = {
        "account": "hello",
        "permission": "active",
        "parent": "owner",
        "auth": {
            "threshold": 1,
            "keys": [
                {
                    "key": "EOS6AjF6hvF7GSuSd4sCgfPKq5uWaXvGM2aQtEUCwmEHygQaqxBSV",
                    "weight": 1
                }
            ],
            "accounts": [{"permission":{"actor": "hello", "permission": "eosio.code"}, "weight":1}],
            "waits": []
        }
    };

    let ret = await tester.pushAction("eosio", "updateauth", updateauth_args, {"hello": "active"});
    expect(ret.except).toBeUndefined();
    await tester.produceBlock();

    try {
        let ret = await tester.deployContract("hello", "target/testtransaction.wasm", "target/testtransaction.abi");
        let args = {
        }
        ret = await tester.pushAction("hello", "testtx", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test singleton', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testsingleton.wasm", "target/testsingleton.abi");
        let args = {
            
        }
        ret = await tester.pushAction("hello", "test", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test nocodegen', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testnocodegen.wasm", "target/testnocodegen.abi");
        let args = {
            "a1": {"a": 123},
            "a2": {"aaa": 123, "bbb": 456},            
        }
        ret = await tester.pushAction("hello", "testnogen", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test finalize', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testfinalize.wasm", "target/testfinalize.abi");
        let args = {}
        ret = await tester.pushAction("hello", "test", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test apply', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testapply.wasm", "target/testapply.abi");
        let args = {
            'name': 'alice'
        }
        ret = await tester.pushAction("hello", "sayhello", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test binaryextension', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testbinaryextension.wasm", "target/testbinaryextension.abi");
        let args = {
            'a1': null,
            'a2': '1.0000 EOS',
            'a3': {'a': 1234}
        }
        ret = await tester.pushAction("hello", "testext", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();

        let args2 = {
            'a1': null,
            'a2': '1.0000 EOS'
        }
        ret = await tester.pushAction("hello", "testext2", args2, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})

it('test optional', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testoptional.wasm", "target/testoptional.abi");
        let args = {
            'a1': null,
            'a2': '1.0000 EOS',
            'a3': {'a': 1234},
            'a4': '4.0000 EOS',
            'a5': {'a1': '5.0000 EOS', 'a2': 123, 'a3': 'hello'},
            'a6': 123,
            'a7': "hello",
            'a8': null,
            'a9': null,
        }
        ret = await tester.pushAction("hello", "testopt", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();

        let args2 = {
            'a1': null,
            'a2': '1.0000 EOS',
            'a3': null,
            'a4': '4.0000 EOS',
        }
        ret = await tester.pushAction("hello", "testopt2", args2, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})


it('test variant', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "target/testvariant.wasm", "target/testvariant.abi");
        let args = {
            a: ['uint64', 10],
            b: ['asset', '1.0000 EOS']    
        }
        ret = await tester.pushAction("hello", "test", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();

        ret = await tester.pushAction("hello", "test2", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();

        let args2 = {
            a1: ["int8", 1],
            a2: ["int16", 2],
            a3: ["int32", 3],
            a4: ["int64", 4],
            a5: ["uint8", 5],
            a6: ["uint16", 6],
            a7: ["uint32", 7],
            a8: ["uint64", 8],
            a9: ["float64", 9.9],
            a10: ["float128", "0xffffffffffffffffffffffffffffffff"],
            a11: ["string", "hello"],
            a12: ["int8[]", [1, 2, 3]],
            a13: ["int16[]", [1, 2, 3]],
            a14: ["int32[]", [1, 2, 3]],
            a15: ["int64[]", [1, 2, 3]],
            a16: ["bytes", 'aabbcc'],
            a17: ["uint16[]", [1, 2, 3]],
            a18: ["uint32[]", [1, 2, 3]],
            a19: ["uint64[]", [1, 2, 3]],
            a20: ["float64[]", [1.1, 2.2, 3.3]],
            a21: ["float128[]", ["0xaafffffffffffffffffffffffffffffa", "0xfffffffffffffffffffffffffffffffb"]],
            a22: ["string[]", ["hello", "world"]],
        }
        ret = await tester.pushAction("hello", "test3", args2, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})



// @chain_test
// def test_contract():
//     # info = chain.get_account('helloworld11')
//     # logger.info(info)
//     with open('./testcontract/testcontract/target/testcontract.wasm', 'rb') as f:
//         code = f.read()
//     with open('./testcontract/testcontract/target/testcontract.abi', 'rb') as f:
//         abi = f.read()

//     chain.deploy_contract('hello', code, abi, 0)

//     args = {
//         'data1': {'name': 'data1'},
//         'data2': {'name': 'data2'},
//         'data3': {'name': 'data3'},
//         'data4': '1.0000 EOS'
//     }
//     r = chain.push_action('hello', 'testmydata', args, {'hello': 'active'})
//     logger.info('++++++elapsed: %s', r['elapsed'])

it('test contract', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "./testcontract/testcontract/target/testcontract.wasm", "./testcontract/testcontract/target/testcontract.abi");
        let args = {
            'data1': {'name': 'data1'},
            'data2': {'name': 'data2'},
            'data3': {'name': 'data3'},
            'data4': '1.0000 EOS'
        }
        ret = await tester.pushAction("hello", "testmydata", args, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})