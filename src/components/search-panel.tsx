"use client";

import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import type { TagItem } from "@/lib/data";
import { activeFilterEntries } from "@/lib/filter-params";
import { confidenceOptions, labelize, moduleConfigs, recordKinds, riskOptions, secrecyOptions, statusOptions } from "@/lib/modules";
import { cn } from "@/lib/utils";

type FilterLevel = "basic" | "technical" | "complete";

const filterLevels: Array<{ value: FilterLevel; label: string }> = [
  { value: "basic", label: "Basico" },
  { value: "technical", label: "Tecnico" },
  { value: "complete", label: "Completo" },
];

const filterLabels: Record<string, string> = {
  q: "Busca",
  module: "Modulo",
  tag: "Tag",
  risk: "Risco",
  secrecy: "Sigilo",
  confidence: "Confiabilidade",
  status: "Status",
  media: "Midia",
  order: "Ordem",
  view: "Vista",
  publication: "Publicacao",
  featured: "Destaque",
};

function normalizeLevel(value: unknown): FilterLevel | null {
  return value === "basic" || value === "technical" || value === "complete" ? value : null;
}

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
  const defaultLevel = normalizeLevel(defaultValues.level) ?? "basic";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>(defaultLevel);
  const useMobileDrawer = !compact && !admin;
  const activeFilters = activeFilterEntries(defaultValues, filterLabels).filter(
    (entry) => !["order", "view", "level"].includes(entry.key),
  );

  function openFilters() {
    if (!defaultValues.level) {
      const savedLevel = normalizeLevel(window.localStorage.getItem("lua-branca:filterLevel"));
      if (savedLevel) setFilterLevel(savedLevel);
    }
    setFiltersOpen(true);
  }

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
        localStorage.setItem("lua-branca:filterLevel", filterLevel);
      }}
      className="self-start rounded-md border border-white/10 bg-[#0c1721]/86 p-3 shadow-[0_0_32px_rgba(125,211,252,0.06)]"
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
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
        <div className={cn("grid gap-2", useMobileDrawer && "grid-cols-[1fr_44px] sm:contents")}>
          <button className="lua-pressable h-11 rounded border border-cyan-200/35 bg-cyan-200/15 px-4 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/20">
            Consultar
          </button>
          {useMobileDrawer && (
            <button
              type="button"
              onClick={openFilters}
              className="lua-pressable grid h-11 w-11 place-items-center rounded border border-white/10 bg-white/[0.04] text-cyan-100 transition hover:border-cyan-200/30 hover:bg-cyan-200/10 sm:hidden"
              aria-label="Abrir filtros"
            >
              <Filter className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
      {useMobileDrawer && activeFilters.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 sm:hidden">
          {activeFilters.slice(0, 4).map((entry) => (
            <span
              key={`${entry.key}-${entry.value}`}
              className="shrink-0 rounded border border-cyan-200/20 bg-cyan-200/10 px-2 py-1 text-[11px] text-cyan-50"
            >
              {entry.label}: {entry.value.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      )}
      {!compact && (
        <>
          {useMobileDrawer && filtersOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm sm:hidden"
              aria-label="Fechar filtros"
              onClick={() => setFiltersOpen(false)}
            />
          )}
          <div
            className={cn(
              "mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-6",
              useMobileDrawer &&
                "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-50 max-sm:max-h-[78vh] max-sm:overflow-y-auto max-sm:rounded-t-md max-sm:border max-sm:border-cyan-200/20 max-sm:bg-[#07121c] max-sm:p-4 max-sm:shadow-[0_-20px_50px_rgba(0,0,0,0.55)] max-sm:transition-transform max-sm:duration-300 max-sm:ease-out",
              useMobileDrawer && filtersOpen && "max-sm:translate-y-0",
              useMobileDrawer && !filtersOpen && "max-sm:pointer-events-none max-sm:translate-y-full",
            )}
          >
          {useMobileDrawer && (
            <>
              <div className="flex items-center justify-between gap-3 sm:hidden">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/55">Filtros</p>
                  <p className="mt-1 text-sm text-zinc-300">Escolha o nivel de leitura.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded border border-white/10 bg-white/[0.04] text-zinc-200"
                  aria-label="Fechar filtros"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {filterLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFilterLevel(level.value)}
                    className={cn(
                      "lua-pressable h-9 rounded border px-2 text-xs font-semibold uppercase tracking-[0.12em]",
                      filterLevel === level.value
                        ? "border-cyan-200/45 bg-cyan-200/15 text-cyan-50"
                        : "border-white/10 bg-white/[0.035] text-zinc-400",
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="level" value={filterLevel} />
            </>
          )}
          <Select
            name="module"
            label="Modulo"
            options={recordKinds.map((kind) => ({
              value: moduleConfigs[kind].route,
              label: moduleConfigs[kind].title,
            }))}
            defaultValue={defaultValues.module}
            drawerMode={useMobileDrawer}
            currentLevel={filterLevel}
            level="basic"
          />
          <Select name="tag" label="Tag" options={tags.map((tag) => ({ value: tag.slug, label: `${tag.name} (${tag.record_count})` }))} defaultValue={defaultValues.tag} drawerMode={useMobileDrawer} currentLevel={filterLevel} level="basic" />
          <Select name="risk" label="Risco" options={riskOptions} defaultValue={defaultValues.risk} drawerMode={useMobileDrawer} currentLevel={filterLevel} level="technical" />
          <Select name="secrecy" label="Sigilo" options={secrecyOptions} defaultValue={defaultValues.secrecy} drawerMode={useMobileDrawer} currentLevel={filterLevel} level="technical" />
          <Select name="confidence" label="Confiabilidade" options={confidenceOptions} defaultValue={defaultValues.confidence} drawerMode={useMobileDrawer} currentLevel={filterLevel} level="technical" />
          <Select name="status" label="Status" options={statusOptions} defaultValue={defaultValues.status} drawerMode={useMobileDrawer} currentLevel={filterLevel} level="technical" />
          <Select
            name="media"
            label="Midia"
            options={[
              { value: "with_media", label: "Com midia/anexo" },
              { value: "without_media", label: "Sem midia/anexo" },
            ]}
            defaultValue={defaultValues.media}
            drawerMode={useMobileDrawer}
            currentLevel={filterLevel}
            level="complete"
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
            drawerMode={useMobileDrawer}
            currentLevel={filterLevel}
            level="complete"
          />
          <Select
            name="view"
            label="Vista"
            options={[
              { value: "list", label: "Lista" },
              { value: "grid", label: "Grade" },
            ]}
            defaultValue={defaultValues.view ?? "list"}
            drawerMode={useMobileDrawer}
            currentLevel={filterLevel}
            level="complete"
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
          {useMobileDrawer && (
            <button className="lua-pressable h-11 rounded border border-cyan-200/35 bg-cyan-200/15 px-4 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/20 sm:hidden">
              Aplicar filtros
            </button>
          )}
          </div>
        </>
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
  drawerMode = false,
  currentLevel = "basic",
  level = "basic",
}: {
  name: string;
  label: string;
  options: readonly string[] | Array<{ value: string; label: string }>;
  defaultValue?: string | string[];
  drawerMode?: boolean;
  currentLevel?: FilterLevel;
  level?: FilterLevel;
}) {
  return (
    <label className={cn("block", drawerMode && currentLevel !== level && "hidden sm:block")}>
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
