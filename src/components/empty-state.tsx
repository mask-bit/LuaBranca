import { SearchX } from "lucide-react";

export function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Quando itens forem publicados, eles aparecem aqui com classificacao, tags e relacoes.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <SearchX className="mx-auto h-9 w-9 text-cyan-100/45" aria-hidden />
      <h2 className="mt-4 text-base font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
