import {ChainTester} from "../src/index"

it('test hello', async () => {
    let tester = new ChainTester();
    await tester.init();

    try {
        let info = await tester.getInfo();
        console.log(info.head_block_time);

        await tester.produceBlock(10);
        await tester.produceBlock();

        info = await tester.getInfo();
        console.log(info.head_block_time);

        let key = await tester.createKey();
        console.log(key);

        console.log(await tester.getPublicKey(key.private));
        await tester.createAccount("hello", "helloworld33", key["public"], key["public"]);

        await tester.deployContract("hello", "tests/hello.wasm", "tests/hello.abi");

        let ret = await tester.pushAction("hello", "sayhello", {}, {"hello": "active"});
        console.log(ret.elapsed);
        await tester.produceBlock();

        let action = {
            account: "hello",
            action: "sayhello",
            arguments: {},
            permissions: {"hello": "active"},
        };
        ret = await tester.pushActions([action]);
        // ret = await tester.getAccount("hello");
        // console.log(ret);
    } finally {
        tester.free();
    }
})


it('test get_table_rows', async () => {
    let tester = new ChainTester();
    await tester.init();

    try {
        let rows = await tester.getTableRows(true, "eosio.token", "hello", "accounts", "EOS", "", 1);
        // console.log("++++++++=rows:", rows);
        let oldBalance = await tester.getBalance("hello");
        let args = {
            "from": "hello",
            "to": "eosio",
            "quantity": "1.0000 EOS",
            "memo": "hello"
        }
        await tester.pushAction("eosio.token", "transfer", args, {"hello": "active"});
        let newBalance = await tester.getBalance("hello");
        tester.produceBlock();
        expect(oldBalance - newBalance == 10000).toEqual(true);
    } finally {
        tester.free();
    }
})
