export type DecodeStatus = "success" | "corrected_with_warning" | "failure";

export interface DecodeResult {
    status: DecodeStatus;
    bits?: string;
}

export function encodeErrorProtection(bits: string): string {
    const afterHamming = encodeHamming74Frame(bits);
    return encodeRepetition3(afterHamming);
}

export function decodeFrame(bits: string): DecodeResult {
    const rep3 = decodeRepetition3(bits);
    if (rep3.status === "failure") return {status: "failure"};

    const hamming = decodeHamming74Frame(rep3.bits!);
    if (hamming.status === "failure") return {status: "failure"};

    const status =
        rep3.status === "corrected_with_warning" || hamming.status === "corrected_with_warning"
            ? "corrected_with_warning"
            : "success";

    return {status, bits: hamming.bits};
}

const CRC_POLY = "10011";

function computeCRC(data: string, generator: string): string {
    const k = generator.length - 1;
    const bits = (data + "0".repeat(k)).split("").map(Number);
    for (let i = 0; i <= bits.length - generator.length; i++) {
        if (bits[i] === 0) continue;
        for (let j = 0; j < generator.length; j++) {
            bits[i + j] ^= Number(generator[j]);
        }
    }
    return bits.slice(-k).join("");
}

const HAMMING_DATA_BITS = 4;

function computePadCount(raw: string): number {
    return (HAMMING_DATA_BITS - (raw.length % HAMMING_DATA_BITS)) % HAMMING_DATA_BITS;
}

function getRaw(text: string) {
    return text.replace(/\s+/g, "");
}

function encodeHamming74Frame(bits: string): string {
    const raw = getRaw(bits);
    const padCount = computePadCount(raw);
    const padded = raw + "0".repeat(padCount);
    let hamming = "";
    for (let i = 0; i < padded.length; i += HAMMING_DATA_BITS) {
        hamming += hammingEncodeBlock(padded.slice(i, i + HAMMING_DATA_BITS).split("").map(Number)).join("");
    }
    const padCountBits = padCount.toString(2).padStart(2, "0");
    const crc = computeCRC(hamming + padCountBits, CRC_POLY);
    return hamming + padCountBits + crc;
}

type Flag = "ok" | "block_error";

function decodeHamming74Frame(bits: string): DecodeResult {
    const raw = getRaw(bits);

    const crcBits = CRC_POLY.length - 1;
    const PAD_COUNT_BITS = 2;

    const receivedCRC = raw.slice(-crcBits);
    const withPadCount = raw.slice(0, -crcBits);
    const padCountStr = withPadCount.slice(-PAD_COUNT_BITS);
    const payload = withPadCount.slice(0, -PAD_COUNT_BITS);
    const padCount = parseInt(padCountStr, 2);

    if (payload.length % 7 !== 0) return {status: "failure"};

    const flag: Flag = computeCRC(withPadCount, CRC_POLY) === receivedCRC ? "ok" : "block_error";

    let decodedPayload = "";
    let correctedPayload = "";

    for (let i = 0; i < payload.length; i += 7) {
        const codeword = payload.slice(i, i + 7).split("").map(Number);
        const corrected = hammingDecodeBlock(codeword);
        decodedPayload += extractData(corrected);
        correctedPayload += corrected.join("");
    }

    if (padCount > 0) {
        decodedPayload = decodedPayload.slice(0, -padCount);
    }

    if (flag === "block_error") return {status: "corrected_with_warning", bits: decodedPayload};

    if (computeCRC(correctedPayload + padCountStr, CRC_POLY) === receivedCRC) {
        return {status: "success", bits: decodedPayload};
    }

    return {status: "failure"};
}

export function hammingEncodeBlock(data: number[]): number[] {
    if (data.length !== 4) {
        throw new Error("Dados devem ter 4 bits de comprimento.");
    }

    const [d1, d2, d3, d4] = data;

    const p1 = (d1 ^ d2 ^ d4);
    const p2 = (d1 ^ d3 ^ d4);
    const p4 = (d2 ^ d3 ^ d4);

    return [p1, p2, d1, p4, d2, d3, d4];
}

// extrai os 4 bits de dados (d1,d2,d3,d4) de um codeword Hamming(7,4) corrigido
function extractData(codeword: number[]): string {
    return [codeword[2], codeword[4], codeword[5], codeword[6]].join("");
}

export function hammingDecodeBlock(bits: number[]): number[] {
    if (bits.length !== 7) {
        throw new Error("Codeword deve ter 7 bits de comprimento.");
    }

    const [p1, p2, d1, p4, d2, d3, d4] = bits;

    const s1 = p1 ^ d1 ^ d2 ^ d4;
    const s2 = p2 ^ d1 ^ d3 ^ d4;
    const s4 = p4 ^ d2 ^ d3 ^ d4;

    const errorIndex = s1 + s2 * 2 + s4 * 4;

    if (errorIndex !== 0) {
        // inverte bit incorreto
        bits[errorIndex - 1] = (bits[errorIndex - 1] ^ 1);
    }

    return bits;
}

function encodeRepetition3(bits: string): string {
    return getRaw(bits).split("").map(b => b + b + b).join("");
}

function decodeRepetition3(bits: string): DecodeResult {
    const raw = getRaw(bits);
    if (raw.length % 3 !== 0) return {status: "failure"};

    let result = "";
    let hadCorrection = false;

    for (let i = 0; i < raw.length; i += 3) {
        const ones = (raw[i] === "1" ? 1 : 0)
            + (raw[i + 1] === "1" ? 1 : 0)
            + (raw[i + 2] === "1" ? 1 : 0);
        const bit = ones >= 2 ? "1" : "0";
        if (ones !== 0 && ones !== 3) hadCorrection = true;
        result += bit;
    }

    return {status: hadCorrection ? "corrected_with_warning" : "success", bits: result};
}
