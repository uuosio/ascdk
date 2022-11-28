import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const optionalTpl = `
{{{generateDecorator decorator}}}
{{export}}class {{className}} implements _chain.Packer {

    {{{ExtractClassBody range}}}

    pack(enc: _chain.Encoder): usize {
        let oldSize = enc.getPos();
        {{#each fields}}
        {{{optionalSerialize .}}}
        {{/each}}
        return enc.getPos() - oldPos;
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each fields}}
        {{{optionalDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each fields}}
        {{{optionalGetSize .}}}
        {{/each}}
        return size;
    }
}`;