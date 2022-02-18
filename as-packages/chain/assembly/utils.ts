import { memcpy } from "./env"

export namespace Utils {
    export function getDataStart<T>(arr: Array<T>): usize {
        return changetype<ArrayBufferView>(arr).dataStart;
    }

    export function toU8Array(ab: ArrayBuffer): Array<u8> {
        let size = ab.byteLength;
        let arr = new Array<u8>(size);
        memcpy(arr.dataStart, changetype<usize>(ab), size);
        return arr;
    }

    export function stringToU8Array(s: string): Array<u8> {
        let ab = String.UTF8.encode(s);
        return toU8Array(ab);
    }

    export function calcPackedVarUint32Length(val: u32): usize {
        let n: usize = 0;
        for (;;) {
            val >>= 7;
            n += 1;
            if (val <= 0) {
                break;
            }
        }
        return n;
    }

    export function calcPackedStringLength(val: string): usize {
        let utf8Str = String.UTF8.encode(val);
        return calcPackedVarUint32Length(<u32>utf8Str.byteLength) + utf8Str.byteLength;
    }

}