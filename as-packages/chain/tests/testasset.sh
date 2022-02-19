./build.sh testasset.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_asset || exit 1
