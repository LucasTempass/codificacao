import {getBits, getCharacterCodes} from "@/lib/algorithms/utils";

function encodeEliasGammaInt(n: number): string {
    if (n <= 0) throw new Error("Caractere inválido para codificação.");
    // quantidade de zeros a frente (leading zeros)
    const k = Math.floor(Math.log2(n));
    // converte para binário (radix 2)
    const binary = n.toString(2);
    return "0".repeat(k) + binary;
}

export function encodeEliasGamma(text: string): string {
    const codes = getCharacterCodes(text);
    return codes.map((code) => encodeEliasGammaInt(code)).join(" ");
}

export function decodeEliasGamma(binary: string): string {
    const bits = getBits(binary);

    let result = "";

    let i = 0;

    while (i < bits.length) {
        let leadingZeros = 0;

        while (i < bits.length && bits[i] === "0") {
            leadingZeros++;
            i++;
        }

        // tamanho da palavra a ser decodificada
        const length = leadingZeros + 1;
        const codeword = bits.slice(i, i + length);
        if (codeword.length < length) throw new Error("Não foi possível decodificar.");

        result += String.fromCharCode(parseInt(codeword, 2));

        i += length;
    }

    return result;
}