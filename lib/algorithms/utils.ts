export function getCharacters(text: string) {
    return text
        .split("");
}

export function getCharacterCodes(text: string) {
    const characters = getCharacters(text);
    return characters.map(c => c.charCodeAt(0));
}

export function getBits(binary: string) {
    return binary.replace(/\s+/g, "");
}