import { FileUp } from "lucide-react";
import { PdfImporter } from "@/components/admin/pdf-importer";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ImportPdfPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="space-y-5">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
            <FileUp className="h-5 w-5 text-cyan-100" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Entrada tecnica</p>
            <h1 className="text-2xl font-semibold text-white">Importar PDF</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              O arquivo vira rascunho para revisao antes de publicar.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <p className="rounded border border-amber-200/35 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>
      )}

      <PdfImporter />
    </div>
  );
}
