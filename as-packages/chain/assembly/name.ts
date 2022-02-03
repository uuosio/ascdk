export function S2N(s: string): u64 {
    return 0;
}

export function N2S(n: u64): string {
    return "";
}

export class Name {
    N: u64;
    @inline constructor(s: string) {
        this.N = S2N(s);
    }

    toString(): string {
        return N2S(this.N)
    }
}
