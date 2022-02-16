import { CONFIG } from "../config/compile";

let scope = CONFIG.scope;

export const tableTpl = `

{{export}}class {{className}} implements _chain.MultiIndexValue {

    {{#each fields}}
    {{rangeString}}
    {{/each}}

    {{{constructorFun.rangeString}}}

    {{#each functions}}
    {{rangeString}}
    {{/each}}

    {{{primaryFuncDef.getterPrototype.rangeString}}}

    {{#each secondaryFuncDefs}}
    {{{getterPrototype.rangeString}}}
    {{{setterPrototype.rangeString}}}
    {{/each}}

    serialize(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        {{#each fields}}
        {{{actionParameterSerialize .}}}
        {{/each}}
        return enc.getBytes();
    }
    
    deserialize(data: u8[]): usize {
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

    // primaryFuncDef: DBIndexFunctionDef | null = null;
    // secondaryFuncDefs: DBIndexFunctionDef[] = [];
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

    setSecondaryValue(i: i32, secondaryValue: _chain.SecondaryValue): void {
        switch (i) {
            {{#each secondaryFuncDefs}}
            {{{setSecondaryValue .}}}
            {{/each}}    
            default:
                _chain.assert(false, "bad db index!");
        }
    }
}`;