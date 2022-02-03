export function S2N(s: string): u64 {
    return 0;
}

export function N2S(n: u64): string {
    return "";
}

export class Name {
    N: u64;

    @inline constructor(n: u64) {
        this.N = n;
    }

    static fromString(s: string): Name {
        return new Name(S2N(s));
    }
    toString(): string {
        return N2S(this.N)
    }
}
