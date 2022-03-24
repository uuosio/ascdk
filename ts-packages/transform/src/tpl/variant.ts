import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const variantTpl = `

{{export}}class {{className}} implements _chain.Packer {
    _index: u8;
    {{{ExtractClassBody range}}}

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packNumber<u8>(this._index);
        {{#each fields}}
        {{{variantSerialize .}}}
        {{/each}}
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this._index = dec.unpackNumber<u8>();
        {{#each fields}}
        {{{variantDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 1;
        {{#each fields}}
        {{{variantGetSize .}}}
        {{/each}}
        return size;
    }

    static new<T>(): {{className}} {
        let obj = new {{className}}();
        let id: u32 = 0;
        if (isInteger<T>()) {
            id = 0xffffffff;
        } else if (isString<T>()) {
            id = 0xfffffffe;
        } else {
            id = idof<T>();
        }
        {{#each fields}}
        {{{variantNew .}}}
        {{/each}}
        return obj;
    }

    {{#each fields}}
    {{{variantGet .}}}
    {{/each}}

}`;

