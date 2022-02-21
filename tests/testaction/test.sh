../../ts-packages/transform/bin/.bin/eosio-asc ./assembly/testaction.ts --target release || exit 1
run-ipyeos -m pytest -s -x test.py -k test_ts
