import {
    Asset,
    Symbol,
    Name,
    Action,
    PermissionLevel,
    printString,
    check,
    getSender,
    Contract,
    unpackActionData,
    readActionData,
} from "as-chain";

@packer
class MyData {
    constructor(
        public name: string
    ){}
}

@packer
class MyClass {
    aaa!: u64;
    bbb: u64 | null;
    constructor(
        aaa: u64,
        bbb: u64
    ){
        this.aaa = aaa;
        this.bbb = bbb;
    }
}


@contract
class MyContract extends Contract {
    @action("sayhello")
    sayHello(name: string): void {
        printString(`+++hello, ${name}\n`);
    }
}

// function apply(receiver: u64, firstReceiver: u64, action: u64): void {

// }

export function apply(receiver: u64, firstReceiver: u64, action: u64): void {
	let _receiver = new Name(receiver);
	let _firstReceiver = new Name(firstReceiver);
	let _action = new Name(action);

	let mycontract = new MyContract(_receiver, _firstReceiver, _action);
	let actionData = readActionData();

	if (receiver == firstReceiver) {
		if (action == 0xC1BCD54634000000) {//sayhello
            let args = new sayHelloAction();
            args.unpack(actionData);
            mycontract.sayHello(args.name)
        }
	}
  
	if (receiver != firstReceiver) {
		
	}
	return;
}
