./build.sh testserializer.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_1serialize || exit 1
run-ipyeos -m pytest -s -x test.py -k test_2serialize || exit 1

# run-ipyeos -m pytest -s -x test.py -k $1

