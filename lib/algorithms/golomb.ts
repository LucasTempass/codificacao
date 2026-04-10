import {getCharacterCodes} from "@/lib/algorithms/utils";

const GOLOMB_K = 32;
const GOLOMB_REMAINDER_BITS = 5; // log2(32)

function encodeGolombInt(n: number): string {
    const q = Math.floor(n / GOLOMB_K);
    const r = n % GOLOMB_K;
    // adiciona zeros na frente para manter tamanho fixo conforme log2
    const suffix = r.toString(2).padStart(GOLOMB_REMAINDER_BITS, "0");
    return "0".repeat(q) + "1" + suffix;
}

export function encodeGolomb(text: string): string {
    const codes = getCharacterCodes(text);
    return codes.map((code) => encodeGolombInt(code)).join(" ");
}

export function decodeGolomb(binary: string): string {
    const bits = binary.replace(/\s+/g, "");

    let i = 0;

    let result = "";

    while (i < bits.length) {
        let leadingZeros = 0;

        while (i < bits.length && bits[i] === "0") {
            leadingZeros++;
            i++;
        }

        i++;

        // remove stop bit
        const rBits = bits.slice(i, i + GOLOMB_REMAINDER_BITS);

        // quantidade de bits é fixa no sufixo
        if (rBits.length < GOLOMB_REMAINDER_BITS) throw new Error("Não foi possível decodificar.");

        const code = leadingZeros * GOLOMB_K + parseInt(rBits, 2);
        result += String.fromCharCode(code);

        i += GOLOMB_REMAINDER_BITS;
    }

    return result;
}