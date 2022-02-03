export const storeTpl = `{{export}}class {{className}} extends _chain.Serializer {
  {{#each fields}}
  private {{name}}: {{{type.plainType}}};
  {{/each}}

  serialize(): u8[] {
    let enc = new _chain.Encoder(10);
    {{#each fields}}
    {{{serialize .}}}
    {{/each}}
    return enc.getBytes();
  }

  deserialize(data: u8[]): void {
    let dec = new _chain.Decoder(data);
    {{#each fields}}
    {{{deserialize .}}}
    {{/each}}
  }
}`;