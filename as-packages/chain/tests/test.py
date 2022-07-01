# content of conftest.py
import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--test-name", action="store", default="", help="test name"
    )


@pytest.fixture
def test_name(request):
    return request.config.getoption("--test-name")




import os
import sys
import json
import struct

test_dir = os.path.dirname(__file__)
sys.path.append(os.path.join(test_dir, '..'))

from ipyeos import log
from ipyeos import chaintester
chaintester.chain_config['contracts_console'] = True
logger = log.get_logger(__name__)

def update_auth(chain, account):
    a = {
        "account": account,
        "permission": "active",
        "parent": "owner",
        "auth": {
            "threshold": 1,
            "keys": [
                {
                    "key": 'EOS6AjF6hvF7GSuSd4sCgfPKq5uWaXvGM2aQtEUCwmEHygQaqxBSV',
                    "weight": 1
                }
            ],
            "accounts": [{"permission":{"actor":account,"permission": 'eosio.code'}, "weight":1}],
            "waits": []
        }
    }
    chain.push_action('eosio', 'updateauth', a, {account:'active'})

def init_chain():
    chain = chaintester.ChainTester()
    update_auth(chain, 'hello')
    update_auth(chain, 'alice')
    return chain

chain = None
def chain_test(fn):
    def call(*args, **vargs):
        global chain
        chain = init_chain()
        ret = fn(*args, **vargs)
        chain.free()
        return ret
    return call

class NewChain():
    def __init__(self):
        self.chain = None

    def __enter__(self):
        self.chain = init_chain()
        return self.chain

    def __exit__(self, type, value, traceback):
        self.chain.free()

def get_code_and_abi(entryName):
    with open('./target/' + entryName + '.wasm', 'rb') as f:
        code = f.read()
    with open('./target/' + entryName + '.abi', 'rb') as f:
        abi = f.read()
    return (code, abi)


test_cases = [
    #test basic
    {
        'test_name': 'testname',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test serializer
    {
        'test_name': 'testserializer',
        'action': {
            'account': 'hello',
            'name': 'test1',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test serializer
    {
        'test_name': 'testserializer',
        'action': {
            'account': 'hello',
            'name': 'test2',
            'args': dict(
                a1 = True,
                a2 = 2,
                a3 = 3,
                a4 = 0xff01,
                a5 = 0xff02,
                a6 = 0xffffff00,
                a7 = 0xffffff01,
                a8 = 0xffffffff00000001, #i64
                a9 = 0xffffffff00000002,
                a10 = -1, #i128,
                a11 = "0xffffffffffffffffffffffffffffffff", #u128,
                # a12: VarInt32,
                a13 = 0xfff, #VarUint32,
                a14 = 0xffffff01,
                a15 = 0xfffffffffffffff0,
                # a16: f128,
                a17 = '2021-09-03T04:13:21', # chain.TimePoint,
                a18 = '2021-09-03T04:13:21', # chain.TimePointSec,
                # a19: BlockTimestampType,

                a20 = 'alice',
                # a21: u8[],
                a22 = 'hello,world',
                a23 = 'aa'*19 + 'bb', # Checksum160,
                a24 = 'aa'*31 + 'bb', #Checksum256,
                a25 = 'aa'*63 + 'bb', #: Checksum512,
                a26 = 'PUB_K1_11DsZ6Lyr1aXpm9aBqqgV4iFJpNbSw5eE9LLTwNAxqjJgXSdB8', #PublicKey,
                a27 = 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH', #chain.Signature,
                a28 = '4,EOS', #Symbol
                a29 = 'EOS', #SymbolCode,
                a30 = '0.1000 EOS',
                a31 = ['0.1000 EOS', 'eosio.token'],
                a32 = ['helloo', 'worldd'],
            ),
            'permissions': None,
        },
        'err_msg': None,
    },
    #test MultiIndex
    {
        'test_name': 'testmi',
        'action': {
            'account': 'hello',
            'name': 'testmi',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test Action
    {
        'test_name': 'testaction',
        'action': {
            'account': 'hello',
            'name': 'sayhello',
            'args': {"name": 'bob'},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test Action
    {
        'test_name': 'testaction',
        'action': {
            'account': 'hello',
            'name': 'testgencode',
            'args': dict(
                    a1 = 'hello',
                    a2 = '1.0000 EOS',
                    a3 = 12345,
                    a4 = [1, 2, 3],
                    a5 = ['1.0001 EOS', '2.0002 EOS'],
                ),
            'permissions': None,
        },
        'err_msg': None,
    },
    #test Asset
    {
        'test_name': 'testasset',
        'action': {
            'account': 'hello',
            'name': 'test1',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test PublicKey
    {
        'test_name': 'testpublickey',
        'action': {
            'account': 'hello',
            'name': 'testpub',
            'args': dict(
                k1='PUB_K1_11DsZ6Lyr1aXpm9aBqqgV4iFJpNbSw5eE9LLTwNAxqjJgXSdB8',
                r1='PUB_R1_6FPFZqw5ahYrR9jD96yDbbDNTdKtNqRbze6oTDLntrsANgQKZu',
                webAuthN='PUB_WA_8PPYTWYNkRqrveNAoX7PJWDtSqDUp3c29QGBfr6MD9EaLocaPBmsk5QAHWq4vEQt2',
            ),
            'permissions': None,
        },
        'err_msg': None,
    },
    #test crypto
    {
        'test_name': 'testcrypto',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': {
                'message': 'hello,world',
                'digest': '77df263f49123356d28a4a8715d25bf5b980beeeb503cab46ea61ac9f3320eda',
                'sig': 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH',
                'pub': 'EOS87J9kj21dvniKhqd7A7QPXRz498ek3H3doXoQVPf4VnHHNtt1M',
            },
            'permissions': None,
        },
        'err_msg': None,
    },
    #test system
    {
        'test_name': 'testsystem',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': dict(
                a1 = '2021-09-03T04:13:21', # chain.TimePoint,
                a2 = '2021-09-03T04:13:21', # chain.TimePointSec,
            ),
            'permissions': None,
        },
        'err_msg': None,
    },
    #test print
    {
        'test_name': 'testprint',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': dict(
                a1 = '0x7fffffffffffffffffffffffffffffff',
            ),
            'permissions': None,
        },
        'err_msg': None,
    },
    #test Transaction
    {
        'test_name': 'testtransaction',
        'action': {
            'account': 'hello',
            'name': 'testtx',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test Singleton
    {
        'test_name': 'testsingleton',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
    #test NoCodeGen
    {
        'test_name': 'testnocodegen',
        'action': {
            'account': 'hello',
            'name': 'testnogen',
            'args': {
                "a1": {"a": 123},
                "a2": {"aaa": 123, "bbb": 456},
            },
            'permissions': None,
        },
        'err_msg': None,
    },
    #test finalize
    {
        'test_name': 'testfinalize',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
]

'''
    #test MultiIndex
    {
        'test_name': 'testmi',
        'action': {
            'account': 'hello',
            'name': 'test',
            'args': {},
            'permissions': None,
        },
        'err_msg': None,
    },
'''

@chain_test
def run_test(test_name, action, err_msg=None):
    (code, abi) = get_code_and_abi(test_name)
    chain.deploy_contract('hello', code, abi, 0)

    if not action['permissions']:
        permissions = {action['account']: 'active'}
    else:
        permissions = action['permissions']

    r = chain.push_action(action['account'], action['name'], action['args'], permissions)
    chain.produce_block()

def test_run_testcase(test_name):
    if test_name:
        for test in test_cases:
            if test['test_name'] == test_name:
                run_test(**test)
    else:
        for test in test_cases:
            run_test(**test)

@chain_test
def test_name():
    test_run_testcase('testname')

@chain_test
def test_1serializer():
    test_run_testcase('testserializer')

def test_mi():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    (code, abi) = get_code_and_abi('testmi')

    with NewChain() as chain:
        chain.deploy_contract('hello', code, abi)
        args = dict()
        r = chain.push_action('hello', 'testmi2', args, {'hello': 'active'})
        logger.info('++++++elapsed: %s', r['elapsed'])

    with NewChain() as chain:
        chain.deploy_contract('hello', code, abi)
        args = dict()
        r = chain.push_action('hello', 'testend', args, {'hello': 'active'})
        logger.info('++++++elapsed: %s', r['elapsed'])
        chain.produce_block()

        r = chain.push_action('hello', 'testend', args, {'hello': 'active'})
        logger.info('++++++elapsed: %s', r['elapsed'])
        chain.produce_block()

@chain_test
def test_action():
    test_run_testcase('testaction')

@chain_test
def test_contract():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    with open('./testcontract/testcontract/target/testcontract.wasm', 'rb') as f:
        code = f.read()
    with open('./testcontract/testcontract/target/testcontract.abi', 'rb') as f:
        abi = f.read()

    chain.deploy_contract('hello', code, abi, 0)

    args = {
        'data1': {'name': 'data1'},
        'data2': {'name': 'data2'},
        'data3': {'name': 'data3'},
        'data4': '1.0000 EOS'
    }
    r = chain.push_action('hello', 'testmydata', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

@chain_test
def test_asset():
    test_run_testcase('testasset')


@chain_test
def test_table():
    test_run_testcase('testtable')

@chain_test
def test_publickey():
    test_run_testcase('testpublickey')

@chain_test
def test_crypto():
    test_run_testcase('testcrypto')


@chain_test
def test_system():
    test_run_testcase('testsystem')


@chain_test
def test_print():
    test_run_testcase('testprint')


@chain_test
def test_tx():
    test_run_testcase('testtransaction')


@chain_test
def test_singleton():
    test_run_testcase('testsingleton')


@chain_test
def test_variant():
    code, abi = get_code_and_abi('testvariant')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        a = ['uint64', 10],
        b = ['asset', '1.0000 EOS']
    )

    r = chain.push_action('hello', 'test', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

    r = chain.push_action('hello', 'test2', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

    args = dict(
        a1 = ["int8", 1],
        a2 = ["int16", 2],
        a3 = ["int32", 3],
        a4 = ["int64", 4],
        a5 = ["uint8", 5],
        a6 = ["uint16", 6],
        a7 = ["uint32", 7],
        a8 = ["uint64", 8],
        a9 = ["float64", 9.9],
        a10 = ["float128", "0xffffffffffffffffffffffffffffffff"],
        a11 = ["string", "hello"],
        a12 = ["int8[]", [1, 2, 3]],
        a13 = ["int16[]", [1, 2, 3]],
        a14 = ["int32[]", [1, 2, 3]],
        a15 = ["int64[]", [1, 2, 3]],
        a16 = ["bytes", 'aabbcc'],
        a17 = ["uint16[]", [1, 2, 3]],
        a18 = ["uint32[]", [1, 2, 3]],
        a19 = ["uint64[]", [1, 2, 3]],
        a20 = ["float64[]", [1.1, 2.2, 3.3]],
        a21 = ["float128[]", ["0xaafffffffffffffffffffffffffffffa", "0xfffffffffffffffffffffffffffffffb"]],
        a22 = ["string[]", ["hello", "world"]],
    )
    r = chain.push_action('hello', 'test3', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

@chain_test
def test_gencode():
    test_run_testcase('testgencode')


@chain_test
def test_optional():
    code, abi = get_code_and_abi('testoptional')
    chain.deploy_contract('hello', code, abi, 0)

    args = {
        'a1': None,
        'a2': '1.0000 EOS',
        'a3': {'a': 1234},
        'a4': '4.0000 EOS',
        'a5': {'a1': '5.0000 EOS', 'a2': 123, 'a3': 'hello'},
        'a6': 123,
        'a7': "hello",
        'a8': None,
        'a9': None,
    }

    r = chain.push_action('hello', 'testopt', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

    args = {
        'a1': None,
        'a2': '1.0000 EOS',
        'a3': None,
        'a4': '4.0000 EOS',
    }
    r = chain.push_action('hello', 'testopt2', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

@chain_test
def test_binaryextension():
    code, abi = get_code_and_abi('testbinaryextension')
    chain.deploy_contract('hello', code, abi, 0)

    args = {
        'a1': None,
        'a2': '1.0000 EOS',
        'a3': {'a': 1234}
    }
    r = chain.push_action('hello', 'testext', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

    args = {
        'a1': None,
        'a2': '1.0000 EOS'
    }
    r = chain.push_action('hello', 'testext2', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

@chain_test
def test_apply():
    code, abi = get_code_and_abi('testapply')
    chain.deploy_contract('hello', code, abi, 0)

    args = {
        'name': 'alice'
    }
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

@chain_test
def test_nocodegen():
    test_run_testcase('testnocodegen')

@chain_test
def test_finalize():
    test_run_testcase('testfinalize')
