import {getBits} from "@/lib/algorithms/utils";

interface HuffmanNode {
    char: string | null;
    left: HuffmanNode | null;
    right: HuffmanNode | null;
}

const tree: HuffmanNode = generateTree();
const codes = generateCodes(tree);

export function encodeHuffman(text: string): string {
    let result = "";
    for (const char of text) result += codes.get(char);
    return result;
}

export function decodeHuffman(binary: string): string {
    const bits = getBits(binary);

    let result = "";

    let current: HuffmanNode | null = tree;

    for (const bit of bits) {
        current = bit === "0" ? current.left : current.right;

        // não encontrado na árvore
        if (current == null) throw new Error("Não foi possível decodificar.");

        if (current.char !== null) {
            result += current.char;
            current = tree;
        }
    }

    return result;
}

function generateTree() {
    // inicializa todos os caracteres da tabela ASCII como vazios
    const heap: (HuffmanNode & { freq: number })[] = Array.from({length: 128}, (_, i) => ({
        char: String.fromCharCode(i),
        freq: getFreq(i),
        left: null,
        right: null,
    }));

    while (heap.length > 1) {
        heap.sort((a, b) => a.freq - b.freq);
        const left = heap.shift()!;
        const right = heap.shift()!;
        heap.push({char: null, freq: left.freq + right.freq, left, right});
    }

    return heap[0];
}

function getFreq(i: number) {
    const priorityFactor = 2;
    // prioriza letras do alfabeto em ordem crescente, assim como minúsculas duas vezes mais
    if (i >= 65 && i <= 90) { // A - Z
        return (91 - i) * priorityFactor;
    }
    if (i >= 97 && i <= 122) { // a - z
        return (123 - i) * priorityFactor * priorityFactor;
    }
    return 1;
}

function generateCodes(tree: HuffmanNode) {
    const codes = new Map<string, string>();
    walk(tree, "", codes);
    return codes;
}

function walk(node: HuffmanNode, prefix: string, codeMap: Map<string, string>) {
    if (node.char === null) {
        if (node.left) walk(node.left, prefix + "0", codeMap);
        if (node.right) walk(node.right, prefix + "1", codeMap);
    } else {
        codeMap.set(node.char, prefix);
    }
}
