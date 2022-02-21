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

def test_ts():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    with open('./assembly/target/target.wasm', 'rb') as f:
        code = f.read()
    chain.deploy_contract('hello', code, b'', 0)
    # class MyStruct {
    #     constructor(
    #         public a1: u64=0,
    #         public a2: u64=0,
    #         public a3: u8[]=[],
    #     ) {}
    # }
    args = struct.pack('QQB', 11, 22, 2)
    args += struct.pack('BB', 33, 44)
    r = chain.push_action('hello', 'count', args, {'hello': 'active'})
