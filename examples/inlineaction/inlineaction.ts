import { Contract, PermissionLevel, printString, action, contract, ActionWrapper } from "as-chain"

@contract("inlineaction")
class InlineAction extends Contract {
    static sayGoodbyeAction: ActionWrapper = new ActionWrapper("saygoodbye");
    static sayHelloAction: ActionWrapper = new ActionWrapper("sayhello");
    
    @action("saygoodbye")
    sayGoodbye(name: string, name2: string): void {
        printString(`+++goodbye, ${name} ${name2}\n`)    
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        const action = InlineAction.sayGoodbyeAction.act(this.receiver, new PermissionLevel(this.receiver))
        action.send(new sayGoodbyeAction('alice', 'bob'))
        printString(`hello, ${name}\n`)
    }
}