import { CONFIG } from "../config/compile";

let scope = CONFIG.scope;

export const tableTpl = `

{{export}}class {{className}} implements _chain.MultiIndexValue {

    {{{ExtractClassBody range}}}

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        {{#each fields}}
        {{{actionParameterSerialize .}}}
        {{/each}}
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each fields}}
        {{{actionParameterDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each fields}}
        {{{actionParameterGetSize .}}}
        {{/each}}
        return size;
    }

    getPrimaryValue(): u64 {
        return this.{{{primaryFuncDef.getterPrototype.declaration.name.text}}}
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        switch (i) {
            {{#each secondaryFuncDefs}}
            {{{getSecondaryValue .}}}
            {{/each}}
            default:
                _chain.assert(false, "bad db index!");
                return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
        }
    }

    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        switch (i) {
            {{#each secondaryFuncDefs}}
            {{{setSecondaryValue .}}}
            {{/each}}
            default:
                _chain.assert(false, "bad db index!");
        }
    }

    static newMultiIndex(code: _chain.Name, scope: _chain.Name): _chain.MultiIndex<{{className}}> {
        let newObj = ():{{className}} => {
            return new {{className}}();
        };
        let tableName = _chain.Name.fromString("{{tableName}}");
        let idxTableBase: u64 = (tableName.N & 0xfffffffffffffff0);

        let indexes: _chain.IDXDB[] = [
            {{#each secondaryFuncDefs}}
            {{{getSecondaryType .}}}
            {{/each}}
        ];
        return new _chain.MultiIndex<{{className}}>(code, scope, tableName, newObj, indexes);
    }
}`;
