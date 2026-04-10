"use client";

import { useState } from "react";
import { algorithms, type Algorithm } from "@/lib/codecs";
import Encoder from "@/app/components/Encoder";
import Decoder from "@/app/components/Decoder";

type Tab = "encode" | "decode";

export default function Compressor() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("fibonacci");

  const [tab, setTab] = useState<Tab>("encode");

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <label
          htmlFor="algorithm"
          className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1"
        >
          Algoritmo
        </label>
        <select
          id="algorithm"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          {algorithms.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setTab("encode")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "encode"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Codificar
          </button>
          <button
            onClick={() => setTab("decode")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "decode"
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Decodificar
          </button>
        </div>
        <div className="pt-6">
          {tab === "encode" ? (
            <Encoder algorithm={algorithm} />
          ) : (
            <Decoder algorithm={algorithm} />
          )}
        </div>
      </div>
    </div>
  );
}
