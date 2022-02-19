./build.sh testmi.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_mi || exit 1
