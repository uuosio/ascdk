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
    with open('./target/target.wasm', 'rb') as f:
        code = f.read()
    with open('~lib/rt/target/metadata.json', 'rb') as f:
        abi = f.read()
    chain.deploy_contract('hello', code, abi, 0)

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
        # a13: VarUint32,
        a14 = 0xffffff01,
        a15 = 0xfffffffffffffff0,
        # a16: f128,
        # a17: TimePoint,
        # a18: TimePointSec,
        # a19: BlockTimestampType,
        a20 = 'alice',
        # a21: u8[],
        a22 = 'hello,world',
        # a23: Checksum160,
        # a24: Checksum256,
        # a25: Checksum512,
        # a26: PublicKey,
        # a27: chain.Signature,
        # a28: chain.Symbol,
        # a29: chain.SymbolCode,
        a30 = '0.1000 EOS',
        # a31: chain.ExtendedAsset,
    )
    r = chain.push_action('hello', 'test1', args, {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

