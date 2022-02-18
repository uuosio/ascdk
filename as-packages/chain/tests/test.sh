./build.sh testaction.ts || exit 1
run-ipyeos -m pytest -s -x test.py -k test_action || exit 1

# ./build.sh testserializer.ts || exit 1
# run-ipyeos -m pytest -s -x test.py -k test_1serialize || exit 1
# run-ipyeos -m pytest -s -x test.py -k test_2serialize || exit 1

# run-ipyeos -m pytest -s -x test.py -k $1

