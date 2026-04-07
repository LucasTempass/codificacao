import {getBits, getCharacterCodes} from "@/lib/algorithms/utils";

export function encodeFibonacci(text: string): string {
    const codes = getCharacterCodes(text);
    return codes.map((code) => encodeFibonacciInt(code)).join(" ");
}

export function decodeFibonacci(binary: string): string {
    const bits = getBits(binary);

    // conforme tabela ASCII
    const fibs = computeFibs(127);

    let result = "";

    let i = 0;

    // processa todos os bits, quebrando em palavras conforme stop bit
    while (i < bits.length) {
        let codeword = "";
        let found = false;

        while (i < bits.length) {
            codeword += bits[i++];
            // procura stop bit
            if (codeword.length >= 2 && codeword.endsWith("11")) {
                found = true;
                break;
            }
        }

        if (!found) throw new Error("Não foi possível decodificar.");

        // remove stop bit
        const payload = codeword.slice(0, -1);

        const n = decodeFibonacciInt(payload, fibs);

        result += String.fromCharCode(n);
    }

    return result;
}

function computeFibs(max: number): number[] {
    const fibs = [1, 2];
    while (true) {
        const next = fibs[fibs.length - 1] + fibs[fibs.length - 2];
        if (next > max) break;
        fibs.push(next);
    }
    return fibs;
}

function decodeFibonacciInt(payload: string, fibs: number[]) {
    let n = 0;
    for (let i = 0; i < payload.length; i++) {
        if (payload[i] === "1") n += fibs[i] ?? 0;
    }
    return n;
}

function encodeFibonacciInt(n: number): string {
    if (n <= 0) throw new Error("Caractere inválido para codificação.");
    const fibs = computeFibs(n);
    const bits = new Array<string>(fibs.length).fill("0");
    let remaining = n;
    for (let i = fibs.length - 1; i >= 0; i--) {
        if (fibs[i] <= remaining) {
            bits[i] = "1";
            remaining -= fibs[i];
        }
    }
    return bits.join("") + "1"; // terminator bit → last bit always creates "11"
}
