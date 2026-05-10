"use client";

import { Search } from "lucide-react";
import type { TagItem } from "@/lib/data";
import { confidenceOptions, labelize, moduleConfigs, recordKinds, riskOptions, secrecyOptions, statusOptions } from "@/lib/modules";

export function SearchPanel({
  action = "/buscar",
  defaultValues = {},
  tags = [],
  compact = false,
  admin = false,
}: {
  action?: string;
  defaultValues?: Record<string, string | string[] | undefined>;
  tags?: TagItem[];
  compact?: boolean;
  admin?: boolean;
}) {
  const defaultQuery = typeof defaultValues.q === "string" ? defaultValues.q : "";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const filters = Object.fromEntries(
          Array.from(formData.entries())
            .filter(([, value]) => typeof value === "string" && value.length > 0)
            .map(([key, value]) => [key, value]),
        );
        localStorage.setItem("lua-branca:lastFilters", JSON.stringify(filters));
      }}
      className="self-start rounded-md border border-white/10 bg-[#0c1721]/86 p-3 shadow-[0_0_32px_rgba(125,211,252,0.06)]"
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
          <input
            name="q"
            defaultValue={defaultQuery}
            placeholder="Buscar no arquivo"
            className="h-11 w-full rounded border border-white/10 bg-black/25 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-200/45"
          />
        </label>
        <button className="h-11 rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18">
          Consultar
        </button>
      </div>
      {!compact && (
        <div className="mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Select
            name="module"
            label="Modulo"
            options={recordKinds.map((kind) => ({
              value: moduleConfigs[kind].route,
              label: moduleConfigs[kind].title,
            }))}
            defaultValue={defaultValues.module}
          />
          <Select name="tag" label="Tag" options={tags.map((tag) => ({ value: tag.slug, label: `${tag.name} (${tag.record_count})` }))} defaultValue={defaultValues.tag} />
          <Select name="risk" label="Risco" options={riskOptions} defaultValue={defaultValues.risk} />
          <Select name="secrecy" label="Sigilo" options={secrecyOptions} defaultValue={defaultValues.secrecy} />
          <Select name="confidence" label="Confiabilidade" options={confidenceOptions} defaultValue={defaultValues.confidence} />
          <Select name="status" label="Status" options={statusOptions} defaultValue={defaultValues.status} />
          <Select
            name="media"
            label="Midia"
            options={[
              { value: "with_media", label: "Com midia/anexo" },
              { value: "without_media", label: "Sem midia/anexo" },
            ]}
            defaultValue={defaultValues.media}
          />
          <Select
            name="order"
            label="Ordem"
            options={[
              { value: "updated_desc", label: "Atualizados" },
              { value: "created_desc", label: "Recentes" },
              { value: "title_asc", label: "Titulo A-Z" },
            ]}
            defaultValue={defaultValues.order ?? "updated_desc"}
          />
          <Select
            name="view"
            label="Vista"
            options={[
              { value: "list", label: "Lista" },
              { value: "grid", label: "Grade" },
            ]}
            defaultValue={defaultValues.view ?? "list"}
          />
          {admin && (
            <>
              <Select
                name="publication"
                label="Publicacao"
                options={[
                  { value: "published", label: "Publicado" },
                  { value: "draft", label: "Rascunho" },
                ]}
                defaultValue={defaultValues.publication}
              />
              <Select
                name="featured"
                label="Destaque"
                options={[{ value: "featured", label: "Somente destaque" }]}
                defaultValue={defaultValues.featured}
              />
            </>
          )}
        </div>
      )}
    </form>
  );
}

function normalizeOptions(options: readonly string[] | Array<{ value: string; label: string }>) {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: labelize(option) } : option,
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly string[] | Array<{ value: string; label: string }>;
  defaultValue?: string | string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <select
        name={name}
        className="h-10 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-cyan-200/45"
        defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
      >
        <option value="">Todos</option>
        {normalizeOptions(options).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
