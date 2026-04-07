import Compressor from "@/app/components/Compressor";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-1 w-full max-w-2xl flex-col gap-8 py-16 px-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Compressão de Dados
                </h1>
                <Compressor />
            </main>
        </div>
    );
}
