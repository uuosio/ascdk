import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const variantTpl = `
{{{generateDecorator decorator}}}
{{export}}class {{className}} implements _chain.Packer {
    _index: u8;
    value: usize;

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

    static new<T>(value: T): {{className}} {
        let obj = new {{className}}();
        let v = new _chain.VariantValue<T>(value);
        obj.value = changetype<usize>(v);
        {{#each fields}}
        {{{variantNew .}}}
        {{/each}}
        return obj;
    }

    {{#each fields}}
    {{{variantGet .}}}
    {{/each}}

    get<T>(): T {
        {{#each fields}}
        {{{variantGenericGet .}}}
        {{/each}}
        let value = changetype<_chain.VariantValue<T>>(this.value);
        return value.value;
    }

    is<T>(): bool {
        {{#each fields}}
        {{{variantGenericIs .}}}
        {{/each}}
        return false;
    }
}`;

