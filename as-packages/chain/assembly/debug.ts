import * as env from "./env"

export function printi(n: i64): void {
    env.printi(n);
}

export function printString(s: String): void {
    let s1 = String.UTF8.encode(s);
    let dv = new DataView(s1);
    env.prints(dv.dataStart);
}
  
export function printArray(data: u8[]): void {
    let data_buf_in = changetype<ArrayBufferView>(data).dataStart;
    env.prints(data_buf_in);
}


export function printHex(data: u8[]): void {
    let data_ptr = changetype<ArrayBufferView>(data).dataStart;
    env.printhex(data_ptr, data.length);
}
