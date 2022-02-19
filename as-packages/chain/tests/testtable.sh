./build.sh testtable.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_table || exit 1
