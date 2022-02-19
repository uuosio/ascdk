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


def test_hello():
    # info = chain.get_account('helloworld11')
    # logger.info(info)
    with open('./hello/target/target.wasm', 'rb') as f:
        code = f.read()
    chain.deploy_contract('hello', code, b'', 0)
    r = chain.push_action('hello', 'sayhello', b'', {'hello': 'active'})
    logger.info('++++++elapsed: %s', r['elapsed'])

