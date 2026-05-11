import type { Metadata } from "next";
import Link from "next/link";
import { Hash } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { fetchTags } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tags",
  description: "Tags cadastradas no arquivo Lua Branca.",
};

export default async function TagsPage() {
  const tags = await fetchTags(true);

  return (
    <div className="space-y-6">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
            <Hash className="h-5 w-5 text-cyan-100" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Indice de filtros</p>
            <h1 className="text-3xl font-semibold text-white">Tags</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Chaves cadastradas para classificar e cruzar registros.
            </p>
          </div>
        </div>
      </header>

      {tags.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/buscar?tag=${tag.slug}`}
              className="rounded-md border border-white/10 bg-[#0d1822]/86 p-4 transition hover:border-cyan-200/35 hover:bg-[#101d28]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">{tag.name}</h2>
                <span className="font-mono text-sm text-cyan-100">{tag.record_count}</span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-zinc-500">{tag.slug}</p>
              {tag.record_count === 0 && (
                <p className="mt-3 text-xs leading-5 text-zinc-500">Ainda sem registro publicado vinculado.</p>
              )}
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState title="Nenhuma tag cadastrada" description="As tags aparecem aqui depois de criadas no painel admin." />
      )}
    </div>
  );
}
