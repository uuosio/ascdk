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
    with open('./' + entryName + '/target/' + entryName + '.wasm', 'rb') as f:
        code = f.read()
    with open('./' + entryName + '/target/' + entryName + '.abi', 'rb') as f:
        abi = f.read()
    return (code, abi)
    
def test_hello():
    (code, abi) = get_code_and_abi('hello')
    chain.deploy_contract('hello', code, abi, 0)
    r = chain.push_action('hello', 'sayhello', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

def test_action():
    (code, abi) = get_code_and_abi('inlineaction')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        name = 'bob'
    )
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

def test_counter():
    (code, abi) = get_code_and_abi('counter')
    chain.deploy_contract('hello', code, abi, 0)

    args = struct.pack('II', 11, 22)
    r = chain.push_action('hello', 'dec2', args, {'hello': 'active'})

    r = chain.push_action('hello', 'zzzzzzzzzzzz', args, {'hello': 'active'})

def test_token():
    (code, abi) = get_code_and_abi('eosio.token')
    chain.deploy_contract('hello', code, abi, 0)

def test_codegeneration():
    (code, abi) = get_code_and_abi('codegeneration')
    chain.deploy_contract('hello', code, abi, 0)
    args = struct.pack('QQB', 11, 22, 2)
    args += struct.pack('BB', 33, 44)
    r = chain.push_action('hello', 'count', args, {'hello': 'active'})

def test_notify():
    with open('./notify/target/sender.wasm', 'rb') as f:
        code = f.read()
    with open('./notify/target/sender.abi', 'rb') as f:
        abi = f.read()
    chain.deploy_contract('hello', code, abi, 0)


    with open('./notify/target/receiver.wasm', 'rb') as f:
        code = f.read()
    with open('./notify/target/receiver.abi', 'rb') as f:
        abi = f.read()
    chain.deploy_contract('helloworld11', code, abi, 0)

    args = {
        'name': 'alice'
    }
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
