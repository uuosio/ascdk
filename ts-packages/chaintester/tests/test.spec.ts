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
        let ret = await tester.createAccount("hello", "helloworld33", key["public"], key["public"]);
        expect(ret.except).toBeUndefined();

        ret = await tester.deployContract("hello", "tests/hello.wasm", "tests/hello.abi");
        expect(ret.except).toBeUndefined();

        ret = await tester.pushAction("hello", "sayhello", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
        console.log(ret.elapsed);
        // ret = await tester.getAccount("hello");
        // console.log(ret);
    } finally {
        tester.free();
    }
})
