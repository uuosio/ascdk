@table("mytable")
class _MyTable {
    constructor(public a: u64 = 0) {}
    @primary
    get primary(): u64 {
        return this.a;
    }
}

export class MyTable extends _MyTable {}
