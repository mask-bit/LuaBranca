import { SearchX } from "lucide-react";

export function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Quando itens forem publicados, eles aparecem aqui com classificacao, tags e relacoes.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "rounded-md border border-dashed border-white/15 bg-white/[0.03] p-4 text-center" : "rounded-md border border-dashed border-white/15 bg-white/[0.03] p-5 text-center sm:p-8"}>
      <SearchX className={compact ? "mx-auto h-6 w-6 text-cyan-100/40" : "mx-auto h-7 w-7 text-cyan-100/45 sm:h-9 sm:w-9"} aria-hidden />
      <h2 className={compact ? "mt-3 text-sm font-semibold text-white" : "mt-3 text-sm font-semibold text-white sm:mt-4 sm:text-base"}>{title}</h2>
      <p className={compact ? "mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-400" : "mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400"}>{description}</p>
    </div>
  );
}
