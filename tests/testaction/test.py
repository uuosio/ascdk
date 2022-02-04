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

def test_ts():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    with open('./assembly/target/target.wasm', 'rb') as f:
        code = f.read()
    chain.deploy_contract('hello', code, b'', 0)
    args = struct.pack('II', 11, 22)
    greeting = b'alice'
    args = int.to_bytes(len(greeting), 1, 'little') + greeting
    r = chain.push_action('hello', 'sayhello', args, {'hello': 'active'})
