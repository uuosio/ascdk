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

{{{generateDecorator decorator}}}

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

    static get tableName(): _chain.Name {
        return _chain.Name.fromString("{{tableName}}");
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indices: _chain.IDXDB[] = [
            {{#each secondaryFuncDefs}}
            {{{newSecondaryDB .}}}
            {{/each}}
        ];
        return indices;
    }

    getTableName(): _chain.Name {
        return {{className}}.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return {{className}}.tableIndexes(code, scope);
    }

    {{{generategetPrimaryFunction this}}}

    {{#if hasSecondaryIndexes}}
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
    {{else}}
    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }
    {{/if}}


    {{#if singleton}}
    static new(code: _chain.Name, scope: _chain.Name = _chain.EMPTY_NAME): _chain.Singleton<{{className}}> {
        return new _chain.Singleton<{{className}}>(code, scope, this.tableName);
    }
    {{else}}
    static new(code: _chain.Name, scope: _chain.Name  = _chain.EMPTY_NAME): {{className}}DB {
        return new {{className}}DB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
    {{/if}}
}`;
