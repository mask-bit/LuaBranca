import Link from "next/link";
import { X } from "lucide-react";
import { activeFilterEntries } from "@/lib/filter-params";

const labels: Record<string, string> = {
  q: "Busca",
  module: "Modulo",
  tag: "Tag",
  risk: "Risco",
  secrecy: "Sigilo",
  confidence: "Confiabilidade",
  status: "Status",
  media: "Midia",
  publication: "Publicacao",
  featured: "Destaque",
  order: "Ordem",
  view: "Vista",
};

export function FilterSummary({
  params,
  basePath,
  total,
}: {
  params: Record<string, string | string[] | undefined>;
  basePath: string;
  total: number;
}) {
  const entries = activeFilterEntries(params, labels).filter(
    (entry) => entry.key !== "level" && !(entry.key === "order" && entry.value === "updated_desc"),
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/10 bg-[#0d1822]/70 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
      <p className="text-xs text-zinc-300 sm:text-sm">
        <span className="font-mono text-cyan-100">{total}</span> registros encontrados
      </p>
      <div className="flex max-w-full gap-2 overflow-x-auto sm:flex-wrap">
        {entries.map((entry) => (
          <span
            key={`${entry.key}-${entry.value}`}
            className="inline-flex h-7 shrink-0 items-center gap-2 rounded border border-cyan-200/25 bg-cyan-200/10 px-2 text-xs text-cyan-50 sm:h-8"
          >
            {entry.label}: {entry.value.replaceAll("_", " ")}
          </span>
        ))}
        {entries.length > 0 && (
          <Link
            href={basePath}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 text-xs text-zinc-300 hover:text-white sm:h-8"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Limpar
          </Link>
        )}
      </div>
    </div>
  );
}
