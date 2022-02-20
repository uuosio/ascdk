import {prints, printui, action_data_size, read_action_data, db_end_i64} from "../assembly/env"
import {u128} from "as-bignum"

import {say_hello, DBI64} from "../assembly/dbi64"
import {IDX64} from "../assembly/idx64"
import {check} from "../assembly/system"

import {printString, printArray, printHex, printi} from "../assembly/debug"

import {IDXDB, SecondaryType, SecondaryValue} from "../assembly/idxdb"
import {MultiIndex, MultiIndexValue} from "../assembly/mi"
import {Name} from "../assembly/Name"

export {printString, printArray, printHex, printi} from "../assembly/debug"

function abort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {

}

// Set up our memory
// By growing our Wasm Memory by 1 page (64KB)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory#Examples
memory.grow(1);

// Store the value 24 at index 0
const index = 0;
const value = 24;
store<u8>(index, value);

let f: f64 = 1.0;
let f_ptr = __alloc(sizeof<f64>());
store<f64>(f_ptr, f);

class Person {
  name: String;
  age: i32;
}

function doSomething(...args: string[]): void {
  args.forEach((value: string, index: number) => {
      console.log(`${index}:${value}`);
  });
}

enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

class MyData implements MultiIndexValue {
  a: u32;
  b: u32;
  getPrimaryValue(): u64 {
    return 0;
  }

  pack(): u8[] {
    return [1, 2, 3];
  }

  unpack(data: u8[]): void {
    return;
  }

  getSecondaryValue(index: usize): SecondaryValue {
    return new SecondaryValue(SecondaryType.U64, new Array<u64>(1));
  }

  setSecondaryValue(index: usize, value: SecondaryValue): void {

  }

}

export function apply(receiver: u64, firstReceiver: u64, action: u64): void {
  let person: Person = {
    name: 'alice',
    age: 21,
  };
  printui(person.age);
  let f: f64 = 1.0;

  let data :u8[] = [0x31, 0x32, 0x33, 0x34, 0x35, 0x0A, 0x00];
  let data_buf_in = changetype<ArrayBufferView>(data).dataStart;
  printui(data_buf_in);
  prints(data_buf_in);
  let s: String = "hello,world";
  printString(s);

  let size = action_data_size();
  var arr = new Array<u8>(size);

  let ptr = changetype<ArrayBufferView>(arr).dataStart;
  read_action_data(ptr, size);

  printArray(arr);

  let n = u128.from(12);
  // printui(a);
  // Read the value at indexOne
  let valueAtIndexOne = load<u8>(1);
  // return valueAtIndexOne;
  say_hello();
  let db = new DBI64(receiver, 2, 3);
  let aa: u8[] = [1, 2, 3, 4];
  let iterator = db.store(1, aa, receiver);
  aa[3] = 9;
  db.store(2, aa, receiver);

  data = db.get(iterator);
  printHex(data);

  {
    let itNext = db.next(iterator);
    printString("\nnext:\n");
    printui(itNext);
    printString(" ");
    data = db.get(itNext);
    printHex(data);

    printString("\nprevious:\n");
    let itPrevious = db.previous(itNext);
    printui(itPrevious);
    printString(" ");
    data = db.get(itPrevious);
    printHex(data);


    printString("\nupdate:\n");
    data[0] = 0xff;
    db.update(itPrevious, receiver, data);
    data = db.get(itPrevious);
    printHex(data);

    printString("\nremove:\n");
    db.remove(itPrevious);

    printString("\nfind 1:\n")
    let it = db.find(1)
    printi(it)

    printString("\nfind 2:\n")
    it = db.find(2)
    printi(it)
    // printui(primary);  
  }

  let idx = new IDX64(receiver, 1, 2);
  check(false, "hello,world");

  let indexes = new Array<SecondaryType>();
  let mi = new MultiIndex<MyData>(receiver, 1, 2, indexes);
  let value = new MyData()
  mi.store(value, new Name(receiver));
}

export function sayHello(): void {
  printString("hello,world");
}

export abstract class Packer {
  abstract pack(): u8[];
  abstract unpack(data: u8[]): void;
}

export class Encoder {
  buf: Array<u8>;
  pos: u32;

  constructor(bufferSize: u32) {
    this.buf = new Array(bufferSize);
  }

  packU32(n: u32): void {
    store<u32>(changetype<ArrayBufferView>(this.buf).dataStart + this.pos, n);
    this.pos += 4;
  }

  getBytes(): u8[] {
    return this.buf.slice(0, this.pos);
  }
}

export class Decoder {
  buf: u8[];
  pos: u32;

  constructor(buf: u8[]) {
    this.buf = buf;
    this.pos = 0;
  }

  unpackU32(): u32 {
    return load<u32>(changetype<ArrayBufferView>(this.buf).dataStart + this.pos)
  }
}
