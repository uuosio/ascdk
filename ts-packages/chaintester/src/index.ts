import fetch from 'cross-fetch';
import { readFileSync } from 'fs';

export class ChainTester {
    id: number
    constructor() {
        this.id = 0;
    }

    async init() {
        let ret = await this.newChain();
        this.id = ret.id;
    }

    sayHello() {
        console.log("hello, world");
    }

    async callMethod(method: string, args: object) {
        const response = await fetch(`http://127.0.0.1:9093/api/${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(args)
            });
            return response.json();   
    }

    async newChain() {
        return this.callMethod('new_chain', {});
    }

    async free() {
        return this.callMethod('free_chain', {id: this.id});
    }

    async produceBlock() {
        return this.callMethod('produce_block', {id: this.id});
    }

    async getInfo(id: number) {
        return this.callMethod('get_info', {id: this.id})
    }

    async getAccount(id: number, account: string) {
        return this.callMethod('get_account', {id: this.id, account: account})
    }

    async deployContract(account: string, wasm_file: string, abi_file: string) {
        let wasm = readFileSync(wasm_file);
        let abi = readFileSync(abi_file, {encoding: "utf8"});

        return this.callMethod('deploy_contract', {
            id: this.id,
            account: account,
            wasm: wasm.toString('hex'),
            abi: abi
        });
    }

    async pushAction(account: string, action: string, args: object, permissions: object) {
        return this.callMethod('push_action', {
            id: this.id,
            account: account,
            action: action,
            arguments: JSON.stringify(args),
            permissions: JSON.stringify(permissions)
        });
    }

    async packActionArgs(contract: string, action: string, action_args: object) {
        let ret = await this.callMethod('pack_action_args', {
            id: this.id,
            contract: contract,
            action: action,
            action_args: JSON.stringify(action_args),
        });

        if (ret.data) {
            console.log(ret);
            return new Promise((resolve, reject) => {
                  resolve(ret.data);
            });    
        } else {
            return new Promise((resolve, reject) => {
                reject(JSON.parse(ret.error));
          });
        }
    }
}
