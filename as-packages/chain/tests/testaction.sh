./build.sh testaction.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_action || exit 1
