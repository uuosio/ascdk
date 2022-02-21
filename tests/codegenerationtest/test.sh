../../ts-packages/transform/bin/.bin/eosio-asc ./assembly/index.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_ts
