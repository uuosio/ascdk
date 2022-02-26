import os
import sys
import time
import json
import pytest
import logging
import hashlib
from pyeoskit import config, wallet
from pyeoskit.chainapi import ChainApiAsync
from pyeoskit.exceptions import ChainException, WalletException

from pyeoskit.testnet import Testnet



Testnet.__test__ = False

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(lineno)d %(module)s %(message)s')
logger=logging.getLogger(__name__)
test_dir = os.path.dirname(__file__)

def get_code_and_abi(entryName):
    with open('./target/' + entryName + '.wasm', 'rb') as f:
        code = f.read()
    with open('./target/' + entryName + '.abi', 'rb') as f:
        abi = f.read()
    return (code, abi)

class TestChainApiAsync(object):

    @classmethod
    def setup_class(cls):
        cls.eosapi = ChainApiAsync('http://127.0.0.1:9000')

        cls.testnet = Testnet(single_node=True, show_log=False)
        cls.testnet.run()
        wallet.import_key('test', '5Jbb4wuwz8MAzTB9FJNmrVYGXo4ABb7wqPVoWGcZ6x8V2FwNeDo')

    @classmethod
    def teardown_class(cls):
        cls.testnet.stop()
        cls.testnet.cleanup()

    def setup_method(self, method):
        global eosapi_async
        eosapi_async = ChainApiAsync('http://127.0.0.1:9000')

    def teardown_method(self, method):
        pass

    @pytest.mark.asyncio
    async def test_tx(self):
        test_account1 = 'helloworld11'
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
        await self.eosapi.push_action('eosio', 'updateauth', a, {test_account1:'active'})


        test_account = 'helloworld11'
        code, abi = get_code_and_abi('testtransaction')
        await self.eosapi.deploy_contract(test_account, code, abi, 0)

        old_balance = await self.eosapi.get_balance(test_account)
        logger.info('+++old blance: %s', old_balance)
        r = await self.eosapi.push_action(test_account, 'testtx', '', {test_account: 'active'})
        new_balance = await self.eosapi.get_balance(test_account)
        logger.info('+++new blance: %s', new_balance)
        time.sleep(5.0)

        new_balance = await self.eosapi.get_balance(test_account)
        logger.info('+++new blance: %s', new_balance)
        logger.info('+++%d %d', old_balance, new_balance)

