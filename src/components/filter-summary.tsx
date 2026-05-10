import Link from "next/link";
import { X } from "lucide-react";
import { activeFilterEntries } from "@/lib/filter-params";

const labels: Record<string, string> = {
  q: "Busca",
  tag: "Tag",
  risk: "Risco",
  secrecy: "Sigilo",
  confidence: "Confiabilidade",
  status: "Status",
  publication: "Publicacao",
  featured: "Destaque",
  order: "Ordem",
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
    (entry) => !(entry.key === "order" && entry.value === "updated_desc"),
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0d1822]/70 px-4 py-3">
      <p className="text-sm text-zinc-300">
        <span className="font-mono text-cyan-100">{total}</span> registros encontrados
      </p>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <span
            key={`${entry.key}-${entry.value}`}
            className="inline-flex h-8 items-center gap-2 rounded border border-cyan-200/25 bg-cyan-200/10 px-2 text-xs text-cyan-50"
          >
            {entry.label}: {entry.value.replaceAll("_", " ")}
          </span>
        ))}
        {entries.length > 0 && (
          <Link
            href={basePath}
            className="inline-flex h-8 items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 text-xs text-zinc-300 hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Limpar
          </Link>
        )}
      </div>
    </div>
  );
}
