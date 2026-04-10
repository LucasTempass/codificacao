import type { Algorithm } from "./codecs";

export type ClientMessage =
    | { type: "setup"; algo: Algorithm }
    | { type: "char"; bitString: string };

export function buildSetupFrame(algo: Algorithm): string {
    return JSON.stringify({ t: "setup", algo });
}

export function buildCharFrame(protectedBits: string): string {
    return JSON.stringify({ t: "char", bits: protectedBits.replace(/\s+/g, "") });
}

export function parseClientMessage(data: string): ClientMessage {
    const msg = JSON.parse(data);
    if (msg.t === "setup") {
        const algo = msg.algo as Algorithm;
        return { type: "setup", algo };
    }
    if (msg.t === "char") {
        return { type: "char", bitString: String(msg.bits) };
    }
    throw new Error(`Tipo de mensagem desconhecido: ${msg.t}`);
}

export function buildSuccessResponse(charCode: number): string {
    return JSON.stringify({ t: "ok", code: charCode });
}

export function buildWarningResponse(charCode: number): string {
    return JSON.stringify({ t: "warn", code: charCode });
}

export function buildErrorResponse(message: string): string {
    return JSON.stringify({ t: "err", message });
}

export function parseResponse(data: string): { charCode: number | null; warning: boolean; error: string | null } {
    const msg = JSON.parse(data);
    if (msg.t === "ok") return { charCode: msg.code, warning: false, error: null };
    if (msg.t === "warn") return { charCode: msg.code, warning: true, error: null };
    return { charCode: null, warning: false, error: msg.message ?? "Erro desconhecido." };
}
