import fetch from 'cross-fetch';
import { readFileSync } from 'fs';

function parse_ret(ret) {
    if (ret.data) {
        return new Promise((resolve, reject) => {
              resolve(ret.data);
        });
    } else {
        return new Promise((resolve, reject) => {
            reject(JSON.parse(ret.error));
      });
    }
}

interface Action {
    account: string;
    action: string;
    permissions: object; //dict like {"hello": "active"}
    arguments: object; //dict
}

interface PushTransactionReturn {
    except: object;
    elapsed: number;
}

export class ChainTester {
    id: number;
    initialize: Promise<number>;
    constructor() {
        this.id = 0;
        this.initialize = this.init();
    }

    async init() {
        if (this.id == 0) {
            let ret = await this.newChain();
            this.id = ret.id;
        }
        return new Promise<number>(resolve => resolve(this.id));
    }

    sayHello() {
        console.log("hello, world");
    }

    async callMethod(method: string, args: object) {
        if (this.id == 0) {
            if ("id" in args) {
                await this.initialize;
                args["id"] = this.id;
            }
        }
        return this.callMethodEx(method, args);
    }

    async callMethodEx(method: string, args: object) {
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
        return this.callMethodEx('new_chain', {});
    }

    async free() {
        if (this.id == 0) {
            return;
        }
        await this.callMethod('free_chain', {id: this.id});
        this.id = 0;
    }

    async produceBlock(nextBlockSkipSeconds: number=0) {
        return this.callMethod('produce_block', {
            id: this.id,
            next_block_skip_seconds: nextBlockSkipSeconds
        });
    }

    async getInfo() {
        return this.callMethod('get_info', {id: this.id})
    }

    async getAccount(account: string) {
        return this.callMethod('get_account', {id: this.id, account: account});
    }

    async createKey() {
        return this.callMethod('create_key', {key_type: "K1"});
    }

    async getPublicKey(priv: string) {
        let ret = await this.callMethod('get_public_key', {priv_key: priv});
        return parse_ret(ret)
    }

    async createAccount(creator: string, account: string, owner_key: string, active_key: string, ram_bytes: number = 5 * 1024 * 1024, stake_net: number = 0, stake_cpu: number = 0) {
        let ret = this.callMethod('create_account', {
                id: this.id,
                creator,
                account,
                owner_key,
                active_key,
                ram_bytes,
                stake_net,
                stake_cpu
            }
        );

        let except = ret['except'];
        if (except) {
            throw new Error(except);
        }

        return new Promise((resolve) => {
                return resolve(ret);
        })
    }

    async deployContract(account: string, wasm_file: string, abi_file: string): Promise<PushTransactionReturn> {
        let wasm = readFileSync(wasm_file);
        let abi = readFileSync(abi_file, {encoding: "utf8"});

        let ret = await this.callMethod('deploy_contract', {
            id: this.id,
            account: account,
            wasm: wasm.toString('hex'),
            abi: abi
        });
        let except = ret['except'];
        if (except) {
            throw new Error(JSON.stringify(except, null, 2));
        }

        return new Promise((resolve) => {
                return resolve(ret);
        })
    }

    async pushAction(account: string, action: string, args: object, permissions: object): Promise<PushTransactionReturn> {
        let ret = this.callMethod('push_action', {
            id: this.id,
            account: account,
            action: action,
            arguments: JSON.stringify(args),
            permissions: JSON.stringify(permissions)
        });

        let except = ret['except'];
        if (except) {
            throw new Error(except);
        }

        return new Promise((resolve) => {
            return resolve(ret);
        })
    }

    async pushActions(actions: Action[]): Promise<PushTransactionReturn>{
        let ret = this.callMethod('push_actions', {
            id: this.id,
            actions: JSON.stringify(actions),
        });

        let except = ret['except'];
        if (except) {
            throw new Error(except);
        }

        return new Promise((resolve) => {
                return resolve(ret);
        })
    }

    async packActionArgs(contract: string, action: string, action_args: object) {
        let ret = await this.callMethod('pack_action_args', {
            id: this.id,
            contract: contract,
            action: action,
            action_args: JSON.stringify(action_args),
        });
        return parse_ret(ret);
    }

    async getTableRows(_json: boolean, code: string, scope: string, table: string, lower_bound: string, upper_bound: string, limit: number, key_type: string="", index_position: string="", reverse: boolean=false, show_payer: boolean=true) {
        return await this.callMethod('get_table_rows', {
            id: this.id,
            _json, code, scope, table, lower_bound, upper_bound, limit, key_type, index_position, reverse, show_payer
        });
    }

    async getBalance(account: string, token_account: string="eosio.token", symbol: string="EOS"): Promise<number> {
        let ret = await this.getTableRows(false, token_account, account, "accounts", "EOS", "", 1);
        if (ret['rows'].length == 0) {
            return new Promise((resolve, reject) => {
                  resolve(0);
            });
        } else {
            let data = ret['rows'][0]['data'];
            // console.log("++++++++++=data:", data);
            let balance = parseInt("0x" + data.slice(0, 16).match(/../g).reverse().join(''));
            return new Promise((resolve, reject) => {
                resolve(balance);
          });
        }        
    }
}
