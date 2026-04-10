import {WebSocket, WebSocketServer} from "ws";
import {type Algorithm, codecs} from "./lib/codecs";
import {decodeFrame} from "./lib/error-correction";
import {buildErrorResponse, buildSuccessResponse, buildWarningResponse, parseClientMessage} from "./lib/helpers";

const PORT = 4000;
const wss = new WebSocketServer({port: PORT});

function applyBitFlipRate(bits: string) {
    return bits.split("").map(x => {
        // taxa média de erros do WiFi, 1 a cada 10 mil bits
        return Math.random() < 0.00001 ? flip(x) : x;
    }).join("");
}

function flip(x: string) {
    return x === '1' ? 0 : 1;
}

wss.on("connection", (ws: WebSocket) => {
    console.log("Cliente conectado.");
    let currentAlgo: Algorithm | null = null;

    ws.on("message", (data: Buffer) => {
        try {
            const msg = parseClientMessage(data.toString());

            if (msg.type === "setup") {
                currentAlgo = msg.algo;
                console.log("Algoritmo configurado:", currentAlgo);
                return;
            }

            if (!currentAlgo) {
                ws.send(buildErrorResponse("Algoritmo não configurado."));
                return;
            }

            console.log("Frame recebido:", msg.bitString);
            const bitsWithAutomaticErrors = msg.bitString;
            console.log("Frame recebido após aplicação de erros automáticos:", applyBitFlipRate(bitsWithAutomaticErrors));
            const result = decodeFrame(bitsWithAutomaticErrors);

            if (result.status === "failure") {
                ws.send(buildErrorResponse("Erro irrecuperável — retransmissão necessária."));
                return;
            }

            const decoded = codecs[currentAlgo].decode(result.bits!);
            console.log(`Decodificado (${result.status}):`, JSON.stringify(decoded));

            if (result.status === "corrected_with_warning") {
                ws.send(buildWarningResponse(decoded.charCodeAt(0)));
            } else {
                ws.send(buildSuccessResponse(decoded.charCodeAt(0)));
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao decodificar.";
            ws.send(buildErrorResponse(msg));
        }
    });

    ws.on("close", () => console.log("Cliente desconectado."));
});

console.log(`Servidor TCP ouvindo em ws://localhost:${PORT}`);
