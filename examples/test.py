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

chain = None
def chain_test(fn):
    def call(*args, **vargs):
        global chain
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
        ret = fn(*args, **vargs)
        chain.free()
        return ret
    return call

def get_code_and_abi(folderName, fileName=""):
    if (fileName == ""):
        fileName = folderName

    with open('./' + folderName + '/target/' + fileName + '.wasm', 'rb') as f:
        code = f.read()
    with open('./' + folderName + '/target/' + fileName + '.abi', 'rb') as f:
        abi = f.read()
    return (code, abi)

@chain_test
def test_hello():
    (code, abi) = get_code_and_abi('hello')
    chain.deploy_contract('hello', code, abi, 0)
    r = chain.push_action('hello', 'sayhello', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

@chain_test
def test_action():
    (code, abi) = get_code_and_abi('inlineaction')
    chain.deploy_contract('hello', code, abi, 0)

    args = dict(
        name = 'bob'
    )
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

@chain_test
def test_counter():
    code, abi = get_code_and_abi('counter')
    chain.deploy_contract('hello', code, abi, 0)

    for i in range(10):
        r = chain.push_action('hello', 'inc', {}, {'hello': 'active'})
        chain.produce_block()
        logger.info('++++elapsed:%s', r['elapsed'])

@chain_test
def test_token():
    (code, abi) = get_code_and_abi('eosio.token', 'eosio.token.contract')
    chain.deploy_contract('hello', code, abi, 0)

@chain_test
def test_codegeneration():
    (code, abi) = get_code_and_abi('codegeneration')
    chain.deploy_contract('hello', code, abi, 0)
    args = struct.pack('QQB', 11, 22, 2)
    args += struct.pack('BB', 33, 44)
    r = chain.push_action('hello', 'count', args, {'hello': 'active'})

@chain_test
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

@chain_test
def test_singleton():
    (code, abi) = get_code_and_abi('singleton')
    chain.deploy_contract('hello', code, abi, 0)
    for i in range(10):
        r = chain.push_action('hello', 'test', {}, {'hello': 'active'})
        chain.produce_block()

@chain_test
def test_allow():
    (code, abi) = get_code_and_abi('allow', 'allow.contract')
    chain.deploy_contract('hello', code, abi, 0)

@chain_test
def test_escrow():
    (code, abi) = get_code_and_abi('escrow', 'escrow.contract')
    chain.deploy_contract('hello', code, abi, 0)

@chain_test
def test_balance():
    (code, abi) = get_code_and_abi('balance', 'balance.contract')
    chain.deploy_contract('hello', code, abi, 0)

@chain_test
def test_finalizer():
    (code, abi) = get_code_and_abi('finalizer')
    chain.deploy_contract('hello', code, abi, 0)

    args = {}
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
