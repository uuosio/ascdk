import os
import sys
import json
import struct

test_dir = os.path.dirname(__file__)
sys.path.append(os.path.join(test_dir, '..'))

from ipyeos import log
from ipyeos.chaintester import ChainTester

logger = log.get_logger(__name__)

chain = ChainTester()

test_account1 = 'hello'
a = {
    "account": test_account1,
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
        "accounts": [{"permission":{"actor":test_account1,"permission": 'eosio.code'}, "weight":1}],
        "waits": []
    }
}
chain.push_action('eosio', 'updateauth', a, {test_account1:'active'})

def get_code_and_abi(entryName):
    with open('./target/' + entryName + '.wasm', 'rb') as f:
        code = f.read()
    with open('./target/' + entryName + '.abi', 'rb') as f:
        abi = f.read()
    return (code, abi)

def test_1serializer():
    # info = chain.get_account('helloworld11')
    # logger.info(info)

    (code, abi) = get_code_and_abi('testserializer')
    chain.deploy_contract('hello', code, abi, 0)

    r = chain.push_action('hello', 'test1', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

    args = dict(
        a1 = True,
        a2 = 2,
        a3 = 3,
        a4 = 0xff01,
        a5 = 0xff02,
        a6 = 0xffffff00,
        a7 = 0xffffff01,
        a8 = 0xffffffff00000001, #i64
        a9 = 0xffffffff00000002,
        # a10: i128,
        # a11: u128,
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
        # a28: chain.Symbol,
        # a29: chain.SymbolCode,
        a30 = '0.1000 EOS',
        a31 = ['0.1000 EOS', 'eosio.token'],
        a32 = ['helloo', 'worldd'],
    )
    r = chain.push_action('hello', 'test2', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

def test_mi():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    (code, abi) = get_code_and_abi('testmi')
    chain.deploy_contract('hello', code, abi, 0)

    r = chain.push_action('hello', 'noop', b'', {'hello': 'active'})

    args = dict(
    )
    r = chain.push_action('hello', 'testmi', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

def test_action():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    (code, abi) = get_code_and_abi('testaction')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        name = 'bob'
    )
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

    args = dict(
        a1 = 'hello',
        a2 = '1.0000 EOS',
        a3 = 12345,
        a4 = [1, 2, 3],
        a5 = ['1.0001 EOS', '2.0002 EOS'],
    )
    r = chain.push_action('hello', 'testgencode', args, {'hello': 'active'})

def test_asset():
    (code, abi) = get_code_and_abi('testasset')
    chain.deploy_contract('hello', code, abi, 0)

    r = chain.push_action('hello', 'test1', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    logger.info('test_asset done!')

def test_table():
    (code, abi) = get_code_and_abi('testtable')
    chain.deploy_contract('hello', code, abi, 0)

    r = chain.push_action('hello', 'testtable', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    logger.info('test_asset done!')
    ret = chain.get_table_rows(True, 'hello', 'hello', 'mytable', '', '', 10)
    logger.info(ret)
    assert ret['rows'][0]['a'] == 1 and ret['rows'][0]['b'] == 2, "bad value"

def test_publickey():
    (code, abi) = get_code_and_abi('testpublickey')
    chain.deploy_contract('hello', code, abi, 0)
    args = dict(
        k1='PUB_K1_11DsZ6Lyr1aXpm9aBqqgV4iFJpNbSw5eE9LLTwNAxqjJgXSdB8',
        r1='PUB_R1_6FPFZqw5ahYrR9jD96yDbbDNTdKtNqRbze6oTDLntrsANgQKZu',
        webAuthN='PUB_WA_8PPYTWYNkRqrveNAoX7PJWDtSqDUp3c29QGBfr6MD9EaLocaPBmsk5QAHWq4vEQt2',
    )
    raw_args = chain.pack_args('hello', 'testpub', args)
    logger.info(raw_args.hex())
    r = chain.push_action('hello', 'testpub', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

def test_crypto():
    (code, abi) = get_code_and_abi('testcrypto')
    chain.deploy_contract('hello', code, abi, 0)
    args = {
        'message': 'hello,world',
        'digest': '77df263f49123356d28a4a8715d25bf5b980beeeb503cab46ea61ac9f3320eda',
        'sig': 'SIG_K1_KXdabr1z4G6e2o2xmi7jPhzxH3Lj5igjR5v3q9LY7KbLWyXBZyES748bPzfM2MhQQVsLrouJzXT9YFfw1CywzMVCcNVMGH',
        'pub': 'EOS87J9kj21dvniKhqd7A7QPXRz498ek3H3doXoQVPf4VnHHNtt1M',
    }
    r = chain.push_action('hello', 'test', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

def test_system():
    (code, abi) = get_code_and_abi('testsystem')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        a1 = '2021-09-03T04:13:21', # chain.TimePoint,
        a2 = '2021-09-03T04:13:21', # chain.TimePointSec,
    )
    r = chain.push_action('hello', 'test', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

def test_print():
    (code, abi) = get_code_and_abi('testprint')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        a1 = '0x7fffffffffffffffffffffffffffffff',
    )

    r = chain.push_action('hello', 'test', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

def test_tx():
    code, abi = get_code_and_abi('testtransaction')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
    )

    r = chain.push_action('hello', 'testtx', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

def test_singleton():
    code, abi = get_code_and_abi('testsingleton')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
    )

    r = chain.push_action('hello', 'test', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

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

def test_gencode():
    code, abi = get_code_and_abi('testgencode')
    chain.deploy_contract('hello', code, abi, 0)

    args = b''
    r = chain.push_action('hello', 'test', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()
