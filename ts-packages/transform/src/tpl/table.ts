import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const tableTpl = `
{{export}}class {{className}}DB extends _chain.MultiIndex<{{className}}> {
    {{#each secondaryFuncDefs}}
    {{{generateGetIdxDBFunction .}}}
    {{/each}}

    {{#each secondaryFuncDefs}}
    {{{generateSetIdxDBValueFunction .}}}
    {{/each}}    
}

{{export}}class {{className}} implements _chain.MultiIndexValue {
    {{{ExtractClassBody range}}}

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        {{#each fields}}
        {{{serializerParameterSerialize .}}}
        {{/each}}
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each fields}}
        {{{serializerParameterDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each fields}}
        {{{serializerParameterGetSize .}}}
        {{/each}}
        return size;
    }

    {{{generategetPrimaryFunction this}}}

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

    {{#if singleton}}
    static new(code: _chain.Name, scope: _chain.Name): _chain.Singleton<{{className}}> {
        let tableName = _chain.Name.fromString("{{tableName}}");
        return new _chain.Singleton<{{className}}>(code, scope, tableName);
    }
    {{else}}
    static new(code: _chain.Name, scope: _chain.Name): {{className}}DB {
        let tableName = _chain.Name.fromString("{{tableName}}"); //{{tableName}}
        let idxTableBase: u64 = (tableName.N & 0xfffffffffffffff0);

        let indexes: _chain.IDXDB[] = [
            {{#each secondaryFuncDefs}}
            {{{newSecondaryDB .}}}
            {{/each}}
        ];
        return new {{className}}DB(code, scope, tableName, indexes);
    }
    {{/if}}
}`;
