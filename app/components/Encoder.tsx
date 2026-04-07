"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { codecs, type Algorithm } from "@/lib/codecs";

const encodeSchema = z.object({
  text: z.string().min(1, "Digite algum texto para codificar."),
});

type EncodeValues = z.infer<typeof encodeSchema>;

interface EncoderProps {
  algorithm: Algorithm;
}

export default function Encoder({ algorithm }: EncoderProps) {
  const [output, setOutput] = useState<string | null>(null);

  const { register, handleSubmit, setError, formState: { errors }, resetField } = useForm<EncodeValues>({
    resolver: zodResolver(encodeSchema),
    defaultValues: { text: "" },
  });

  useEffect(() => {
    setOutput(null);
    resetField('text')
  }, [algorithm, resetField]);

  function onSubmit(data: EncodeValues) {
    if ([...data.text].some((ch) => ch.charCodeAt(0) > 127)) {
      setError("text", {
        message: "Apenas caracteres ASCII (código 0-127) são suportados.",
      });
      return;
    }
    setOutput(codecs[algorithm].encode(data.text));
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
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Saída binária
            </p>
            <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all">
              {output}
            </p>
          </div>
        )}
      </form>
    </section>
  );
}
