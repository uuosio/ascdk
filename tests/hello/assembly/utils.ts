@table("mytable")
class _MyTable {
    a: u64;

    constructor() {
        this.a = 0;
    }

    @primary
    get primary(): u64 {
        return this.a;
    }
}

export class MyTable extends _MyTable {}
