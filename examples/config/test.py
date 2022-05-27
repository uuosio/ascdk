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

    with open('./target/' + fileName + '.wasm', 'rb') as f:
        code = f.read()
    with open('./target/' + fileName + '.abi', 'rb') as f:
        abi = f.read()
    return (code, abi)

@chain_test
def test_config():
    (code, abi) = get_code_and_abi('testconfig')
    chain.deploy_contract('hello', code, abi, 0)

    r = chain.push_action('hello', 'test', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])
