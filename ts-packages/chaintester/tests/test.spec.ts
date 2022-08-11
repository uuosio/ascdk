import {ChainTester} from "../src/index"

it('test hello', async () => {
    let tester = new ChainTester();
    await tester.init();

    try {    
        tester.sayHello();
        let ret = await tester.deployContract("hello", "tests/hello.wasm", "tests/hello.abi");
        ret = await tester.pushAction("hello", "sayhello", {}, {"hello": "active"});
        console.log(ret.elapsed);
        // ret = await tester.getAccount(1, "hello");
        // console.log(ret);
        expect(ret).not.toContain("except");
    } finally {
        tester.free();
    }
})
