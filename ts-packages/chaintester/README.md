Unit tests library for EOS

# Test example
```typescript
import { ChainTester } from "chaintester"

it('test hello', async () => {
    let tester = new ChainTester();
    await tester.init();
    try {
        let ret = await tester.deployContract("hello", "./assembly/target/counter.wasm", "./assembly/target/counter.abi");
        expect(ret.except).toBeUndefined();

        ret = await tester.pushAction("hello", "inc", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
        await tester.produceBlock();
        ret = await tester.pushAction("hello", "inc", {}, {"hello": "active"});
        expect(ret.except).toBeUndefined();
    } finally {
        await tester.free();
    }
})
```

# ChainTester class

## constructor

constructor to create a new ChainTester instance

```typescript
constructor()
```

## free
```typescript
async free()
```

## produceBlock

produce a block manually, `nextBlockSkipSeconds` specifies the next block time in seconds.

```typescript
async produceBlock(nextBlockSkipSeconds: number=0)
```

## getInfo

get chain information

```typescript
async getInfo()
```

## getAccount

return the account information

```typescript
async getAccount(account: string)
```

## createKey

return a pair of public key and private key

```typescript
async createKey()
```

## getPublicKey

return the public key of a private key

```typescript
    async getPublicKey(priv: string)
```

## createAccount

create a new account

```typescript
    async createAccount(creator: string, account: string, owner_key: string, active_key: string, ram_bytes: number = 5 * 1024 * 1024, stake_net: number = 0, stake_cpu: number = 0)
```

## deployContract

deploy a contract with code and abi

```typescript
    async deployContract(account: string, wasm_file: string, abi_file: string): Promise<PushTransactionReturn>
```

## pushAction

push a transaction with one action to the test chain

```typescript
async pushAction(account: string, action: string, args: object, permissions: object): Promise<PushTransactionReturn>
```

## pushActions

push a transaction with actions to the test chain.

```typescript
async pushActions(actions: Action[]): Promise<PushTransactionReturn>
```

## packActionArgs

serialize data in json to raw bytes

```typescript
async packActionArgs(contract: string, action: string, action_args: object)
```

## getTableRows

query database

```typescript
async getTableRows(_json: boolean, code: string, scope: string, table: string, lower_bound: string, upper_bound: string, limit: number, key_type: string="", index_position: string="", reverse: boolean=false, show_payer: boolean=true)
```

## getBalance

retrieve the balance of an account from a token account with the specified symbol

```typescript
async getBalance(account: string, token_account: string="eosio.token", symbol: string="EOS"): Promise<number>
```
