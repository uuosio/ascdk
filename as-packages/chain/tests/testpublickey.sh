./build.sh testpublickey.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_publickey || exit 1
