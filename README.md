![build](https://github.com/uuosio/ascdk/actions/workflows/pr-any.yml/badge.svg?event=push)

# AssemblyScript Smart Contracts Development Kit

## Contract Example
```typescript
import {
    Name,
    Contract,
    print,
} from "as-chain";

@table("counter")
class Counter {
    public key: u64;
    public count: u64;
    constructor(count: u64=0) {
        this.count = count;
        this.key = Name.fromString("counter").N;
    }

    @primary
    get primary(): u64 {
        return this.key;
    }
}

@contract
class MyContract extends Contract {
    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        super(receiver, firstReceiver, action);
    }

    @action("inc")
    inc(): void {
        let mi = Counter.new(this.receiver);
        let it = mi.find(Name.fromString("counter").N);
        let count: u64 = 0;
        let payer: Name = this.receiver;

        if (it.isOk()) {
            let counter = mi.get(it);
            counter.count += 1;
            mi.update(it, counter, payer);
            count = counter.count;
        } else {
            let counter = new Counter(1);
            mi.store(counter, payer);
            count = 1;
        }
        print(`++++++++count:${count}`);
    }
}
```

## Boilerplate
Boilerplate to build your own contract + testing: https://github.com/ProtonProtocol/typescript-smart-contracts


## Installation
```
npm i eosio-asc
```

## Tests

### Install python packages
```
python3 -m venv ~/env                                                                               
source ~/env/bin/activate
```

```
python3 -m pip install --upgrade pip
python3 -m pip install ipyeos
run-ipyeos -m pip install pytest
```

## Run HelloWorld example test
```bash
cd examples
npm run test:hello
```


transform is based on [patractlabs/ask-lang](https://github.com/patractlabs/ask)
