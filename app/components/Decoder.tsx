"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { codecs, type Algorithm } from "@/lib/codecs";

const decodeSchema = z.object({
  binary: z
    .string()
    .min(1, "Cole uma string binária para decodificar.")
    .regex(/^[01\s]+$/, "A entrada deve conter apenas 0s, 1s e espaços."),
});

type DecodeValues = z.infer<typeof decodeSchema>;

interface DecoderProps {
  algorithm: Algorithm;
}

export default function Decoder({ algorithm }: DecoderProps) {
  const [output, setOutput] = useState<string | null>(null);

  const { register, handleSubmit, setError, formState: { errors }, resetField } = useForm<DecodeValues>({
    resolver: zodResolver(decodeSchema),
    defaultValues: { binary: "" },
  });

  useEffect(() => {
    setOutput(null);
    resetField('binary')
  }, [algorithm, resetField]);

  function onSubmit(data: DecodeValues) {
    try {
      setOutput(codecs[algorithm].decode(data.binary));
    } catch {
      setError("binary", {
        message: "Não foi possível decodificar a string binária.",
      });
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
        Decodificar ← Binário
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <textarea
            {...register("binary")}
            placeholder="Cole a string binária aqui (ex: 01101000 01101001)..."
            rows={3}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
          />
          {errors.binary && (
            <p className="mt-1 text-sm text-red-500">{errors.binary.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="self-start rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          ← Decodificar
        </button>
        {output !== null && (
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Texto decodificado
            </p>
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{output}</p>
          </div>
        )}
      </form>
    </section>
  );
}
