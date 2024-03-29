import { CONFIG } from "../config/compile";
// const scope = CONFIG.scope;

// parameters: ParameterNodeDef[] = [];
// methodName: string;

export const actionTpl = `

class {{methodName}}Action implements _chain.Packer {
    constructor (
        {{#each parameters}}
        {{#generateActionParam .}}{{/generateActionParam}}
        {{/each}}
    ) {
    }

    pack(enc: _chain.Encoder): usize {
        let oldPos = enc.getPos();
        {{#each parameters}}
        {{{actionParameterSerialize .}}}
        {{/each}}
        return enc.getPos() - oldPos;
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each parameters}}
        {{{actionParameterDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each parameters}}
        {{{actionParameterGetSize .}}}
        {{/each}}
        return size;
    }
}`;
