import os
import sys
import json
import struct

test_dir = os.path.dirname(__file__)
sys.path.append(os.path.join(test_dir, '..'))

from ipyeos import log
from ipyeos import chaintester
chaintester.chain_config['contracts_console'] = False

logger = log.get_logger(__name__)

chain = chaintester.ChainTester()

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

def test_codegen():
    code, abi = get_code_and_abi('testcodegen')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        a1="hello",# string,
        a2="1.0000 EOS",# Asset,
        a3=1, #: u64,
        a4=[1, 2, 3], #: u64[],
        a5=["1.0000 EOS", "2.0000 EOS"], #: Asset[],
        a6=None,
        a7={"name": "alice"},
    )

    r = chain.push_action('hello', 'testgencode', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()


    args = dict(
        a1="hello",# string,
        a2="1.0000 EOS",# Asset,
        a3=1, #: u64,
        a4=[1, 2, 3], #: u64[],
        a5=["1.0000 EOS", "2.0000 EOS"], #: Asset[],
        a6="1.0000 EOS",
        a7={"name": "alice"},
        a8="12.0000 EOS",
    )

    r = chain.push_action('hello', 'testgencode2', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()

def test_inspect():
    code, abi = get_code_and_abi('testinspection')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        a1={"data": {"name":"hello", "asset": "1.0000 EOS"}},
        a2={"a": 123, "b": {"data": {"name":"hello", "asset": "1.0000 EOS"}}}
    )

    r = chain.push_action('hello', 'testgencode', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
    chain.produce_block()