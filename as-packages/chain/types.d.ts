declare function __alloc(size: usize, id?: u32): usize;

declare function internal(_?: string): any
declare function other(_?: string): any
declare function contract(_?: any): any
declare function action(_?: any, __?: any): any
declare function ignore(_?: string): any
declare function packed(_?: string): any
declare function table(_?: any, __?: string, ___?: string, ____?: string): any
declare function variant(_?: any, __?: any): any
declare function serializer(_?: any): any
declare function primary(_?: any, __?: any): any
declare function secondary(_?: any, __?: any): any
declare function packer(_?: any): any
declare function optional(_?: any): any
declare function binaryextension(_?: any): any

declare module 'as-chain' {
    import main = require('as-chain/assembly/index');
    export = main;
}

// ABI helpers
declare const singleton = "singleton"
declare const nocodegen = "nocodegen";
declare const notify = "notify";
declare const noabigen = "noabigen";
