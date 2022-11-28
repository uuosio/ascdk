import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const binaryExtensionTpl = `
{{{generateDecorator decorator}}}
{{export}}class {{className}} implements _chain.Packer {

    {{{ExtractClassBody range}}}

    pack(enc: _chain.Encoder): usize {
        let oldPos = enc.getPos():
        {{#each fields}}
        {{{binaryExtensionSerialize .}}}
        {{/each}}
        return enc.getPos() - oldPos;
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each fields}}
        {{{binaryExtensionDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each fields}}
        {{{binaryExtensionGetSize .}}}
        {{/each}}
        return size;
    }
}`;