"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useState, useEffect, useRef} from "react";
import {codecs, type Algorithm} from "@/lib/codecs";
import {encodeErrorProtection} from "@/lib/error-correction";
import {buildSetupFrame, buildCharFrame, parseResponse} from "@/lib/helpers";

const encodeSchema = z.object({
    text: z.string().min(1, "Digite algum texto para codificar."),
});

type EncodeValues = z.infer<typeof encodeSchema>;

interface EncoderProps {
    algorithm: Algorithm;
}

type WsStatus = "connecting" | "open" | "closed";

export default function Encoder({algorithm}: EncoderProps) {
    const [output, setOutput] = useState<string | null>(null);
    const [errorCorrected, setErrorCorrected] = useState<string | null>(null);
    const [decoded, setDecoded] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const [wsStatus, setWsStatus] = useState<WsStatus>("closed");
    const [isSending, setIsSending] = useState(false);

    const algorithmRef = useRef(algorithm);
    const wsRef = useRef<WebSocket | null>(null);
    const pendingCharsRef = useRef<string[]>([]);
    const decodedResultRef = useRef<string[]>([]);

    const {register, handleSubmit, setError, formState: {errors}, resetField} = useForm<EncodeValues>({
        resolver: zodResolver(encodeSchema),
        defaultValues: {text: ""},
    });

    useEffect(() => {
        if (algorithmRef.current === algorithm) return;
        algorithmRef.current = algorithm;
        setOutput(null);
        setErrorCorrected(null);
        setDecoded(null);
        setSendError(null);
        resetField("text");
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(buildSetupFrame(algorithm));
        }
    }, [algorithm, resetField]);

    useEffect(() => {
        setWsStatus("connecting");
        const ws = new WebSocket("ws://localhost:4000");

        ws.onopen = () => {
            console.log("Conectado.");
            setWsStatus("open");
            ws.send(buildSetupFrame(algorithmRef.current));
        };
        ws.onclose = () => {
            console.log("Conexão fechada.");
            setWsStatus("closed");
            wsRef.current = null;
        };
        ws.onerror = () => {
            console.log("Conexão fechada por falha.");
            setWsStatus("closed");
        };
        ws.onmessage = (event: MessageEvent<string>) => {
            const response = parseResponse(event.data);
            pendingCharsRef.current.shift();

            if (response.charCode === null) {
                pendingCharsRef.current = [];
                setIsSending(false);
                setSendError(response.error ?? "Erro desconhecido.");
                return;
            }

            decodedResultRef.current.push(String.fromCharCode(response.charCode));

            if (pendingCharsRef.current.length > 0) {
                if (ws.readyState !== WebSocket.OPEN || pendingCharsRef.current.length === 0) {
                    setIsSending(false);
                    return;
                }
                ws.send(buildCharFrame(pendingCharsRef.current[0]));
            } else {
                setIsSending(false);
                setDecoded(decodedResultRef.current.join(""));
            }
        };

        wsRef.current = ws;
        return () => ws.close();
    }, []);

    function encodeAll(text: string, algo: Algorithm) {
        const chars = [...text];
        const rawParts = chars.map((ch) => codecs[algo].encode(ch));
        const protectedParts = rawParts.map((bits) => encodeErrorProtection(bits));
        return {rawParts, protectedParts};
    }

    function onSubmit(data: EncodeValues) {
        if ([...data.text].some((ch) => ch.charCodeAt(0) > 127)) {
            setError("text", {message: "Apenas caracteres ASCII (código 0-127) são suportados."});
            return;
        }
        const {rawParts, protectedParts} = encodeAll(data.text, algorithm);
        setOutput(rawParts.join(" "));
        setErrorCorrected(protectedParts.join(" "));
        setDecoded(null);
        setSendError(null);
    }

    function onDecode() {
        const ws = wsRef.current;
        if (errorCorrected === null || !ws || ws.readyState !== WebSocket.OPEN) return;

        const charFrames = errorCorrected.trim().split(/\s+/).filter(Boolean);
        if (charFrames.length === 0) return;

        pendingCharsRef.current = charFrames;
        decodedResultRef.current = [];
        setIsSending(true);
        setDecoded(null);
        setSendError(null);

        if (pendingCharsRef.current.length === 0) {
            setIsSending(false);
            return;
        }

        ws.send(buildCharFrame(pendingCharsRef.current[0]));
    }

    return (
        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Codificar → Binário
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div>
                    <textarea
                        {...register("text")}
                        placeholder="Digite o texto aqui..."
                        rows={3}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
                    />
                    {errors.text && (
                        <p className="mt-1 text-sm text-red-500">{errors.text.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="self-start rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                >
                    Codificar →
                </button>
                {output !== null && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Saída binária (por caractere, separado por espaço)
                        </label>
                        <div
                            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all">
                            {output}
                        </div>
                    </div>
                )}
                {errorCorrected !== null && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Saída binária (com detecção de erro, por caractere)
                        </label>
                        <textarea
                            value={errorCorrected}
                            onChange={(e) => {
                                setErrorCorrected(e.target.value);
                                setDecoded(null);
                                setSendError(null);
                            }}
                            rows={6}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
                        />
                    </div>
                )}
            </form>

            {errorCorrected !== null && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onDecode}
                            disabled={wsStatus !== "open" || isSending}
                            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSending ? "Enviando…" : "← Enviar"}
                        </button>
                        <span
                            title={wsStatus === "open" ? "Servidor conectado" : wsStatus === "connecting" ? "Conectando..." : "Servidor desconectado"}
                            className={`inline-block h-2.5 w-2.5 rounded-full ${wsStatus === "open" ? "bg-green-500" : wsStatus === "connecting" ? "bg-yellow-400" : "bg-red-500"}`}
                        />
                    </div>
                    {sendError && (
                        <p className="text-sm text-red-500">{sendError}</p>
                    )}
                    {decoded !== null && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                Texto decodificado
                            </label>
                            <div
                                className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200">
                                {decoded}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
