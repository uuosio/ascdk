import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const serializerTpl = `
{{{generateDecorator decorator}}}
{{export}}class {{className}} implements _chain.Packer {
    {{{ExtractClassBody range}}}
    pack(enc: _chain.Encoder): usize {
        let oldPos = enc.getPos();
        {{#each fields}}
        {{{serializerParameterSerialize .}}}
        {{/each}}
        return enc.getPos() - oldPos;
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
}`;