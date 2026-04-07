import {decodeGolomb, encodeGolomb} from "@/lib/algorithms/golomb";
import {decodeEliasGamma, encodeEliasGamma} from "@/lib/algorithms/elias-gamma";
import {decodeFibonacci, encodeFibonacci} from "@/lib/algorithms/fibonacci";
import {decodeHuffman, encodeHuffman} from "@/lib/algorithms/huffman";

export interface Codec {
    encode(text: string): string;

    decode(binary: string): string;
}

export type Algorithm = "golomb" | "elias-gamma" | "fibonacci" | "huffman";

export const codecs: Record<Algorithm, Codec> = {
    golomb: {encode: encodeGolomb, decode: decodeGolomb},
    "elias-gamma": {encode: encodeEliasGamma, decode: decodeEliasGamma},
    fibonacci: {encode: encodeFibonacci, decode: decodeFibonacci},
    huffman: {encode: encodeHuffman, decode: decodeHuffman},
};

export const algorithms: { value: Algorithm; label: string }[] = [
    {value: "golomb", label: "Golomb"},
    {value: "elias-gamma", label: "Elias-Gamma"},
    {value: "fibonacci", label: "Fibonacci/Zeckendorf"},
    {value: "huffman", label: "Huffman"},
];
