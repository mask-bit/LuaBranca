import { Hash, Plus, Trash2 } from "lucide-react";
import { createTagAction, deleteTagAction, updateTagAction } from "@/lib/admin-actions";
import { fetchTags } from "@/lib/data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTagsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tags = await fetchTags(false);
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="space-y-5">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
            <Hash className="h-5 w-5 text-cyan-100" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Vocabulario do arquivo</p>
            <h1 className="text-2xl font-semibold text-white">Tags</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Crie tags globais para filtrar registros publicos e organizar o painel administrador.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <p className="rounded border border-red-200/35 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>
      )}

      <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
          <Plus className="h-4 w-4 text-cyan-100" aria-hidden />
          Nova tag
        </h2>
        <form action={createTagAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input name="name" label="Nome" required placeholder="Energia azul" />
          <Input name="slug" label="Slug opcional" placeholder="energia-azul" />
          <button className="h-11 self-end rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18">
            Adicionar
          </button>
        </form>
      </section>

      <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Tags cadastradas</h2>
          <span className="font-mono text-sm text-cyan-100">{tags.length}</span>
        </div>
        <div className="space-y-3">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <form
                key={tag.id}
                action={updateTagAction.bind(null, tag.id)}
                className="grid gap-3 rounded border border-white/10 bg-black/20 p-3 lg:grid-cols-[1fr_1fr_120px_auto]"
              >
                <Input name="name" label="Nome" defaultValue={tag.name} required />
                <Input name="slug" label="Slug" defaultValue={tag.slug} required />
                <div>
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Registros</span>
                  <span className="flex h-11 items-center rounded border border-white/10 bg-black/25 px-3 font-mono text-cyan-100">
                    {tag.record_count}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <button className="h-11 rounded border border-white/10 bg-white/[0.04] px-4 text-sm text-zinc-200 transition hover:bg-white/[0.07]">
                    Salvar
                  </button>
                  <button
                    formAction={deleteTagAction.bind(null, tag.id)}
                    className="grid h-11 w-11 place-items-center rounded border border-red-200/35 bg-red-500/10 text-red-100 transition hover:bg-red-500/15"
                    aria-label={`Apagar tag ${tag.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </form>
            ))
          ) : (
            <p className="rounded border border-dashed border-white/15 bg-black/20 p-5 text-sm text-zinc-400">
              Nenhuma tag cadastrada ainda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Input({
  name,
  label,
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/45"
      />
    </label>
  );
}
