import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { FilterSummary } from "@/components/filter-summary";
import { ModuleHero } from "@/components/module-hero";
import { RecordCard } from "@/components/record-card";
import { SearchPanel } from "@/components/search-panel";
import { fetchRecords, fetchTags } from "@/lib/data";
import { parseRecordFilters } from "@/lib/filter-params";
import { getKindFromRoute, moduleConfigs } from "@/lib/modules";

type PageProps = {
  params: Promise<{ module: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { module } = await params;
  const kind = getKindFromRoute(module);
  if (!kind) return {};

  const config = moduleConfigs[kind];
  return {
    title: config.title,
    description: config.subtitle,
  };
}

export default async function ModulePage({ params, searchParams }: PageProps) {
  const { module } = await params;
  const values = await searchParams;
  const kind = getKindFromRoute(module);

  if (!kind) notFound();

  const [records, tags, recent] = await Promise.all([
    fetchRecords(parseRecordFilters(values, { kind, publicOnly: true })),
    fetchTags(true),
    fetchRecords({ kind, publicOnly: true, limit: 5 }),
  ]);
  const gridView = values.view === "grid";

  return (
    <div className="space-y-6">
      <ModuleHero kind={kind} />
      <SearchPanel action={`/${module}`} defaultValues={values} tags={tags} />
      <FilterSummary params={values} basePath={`/${module}`} total={records.length} />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {records.length > 0 ? (
            <div className={gridView ? "grid gap-3 xl:grid-cols-2" : "grid gap-3"}>
              {records.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`Nenhum item em ${moduleConfigs[kind].title}`}
              description="O modulo esta pronto para receber registros publicados pelo painel admin."
            />
          )}
        </div>

        <aside className="space-y-3">
          <Panel title="Tags usadas">
            <div className="flex flex-wrap gap-2">
              {tags.filter((tag) => tag.record_count > 0).slice(0, 16).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/${module}?tag=${tag.slug}`}
                  className="rounded border border-cyan-200/25 bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100 hover:bg-cyan-200/15"
                >
                  {tag.name} ({tag.record_count})
                </Link>
              ))}
              {tags.length === 0 && <p className="text-sm text-zinc-400">Nenhuma tag publicada.</p>}
            </div>
          </Panel>
          <Panel title="Recentes">
            <div className="space-y-3">
              {recent.length > 0 ? (
                recent.map((record) => (
                  <Link
                    key={record.id}
                    href={`/${module}/${record.slug}`}
                    className="block border-t border-white/10 pt-3 text-sm text-zinc-300 first:border-t-0 first:pt-0 hover:text-white"
                  >
                    {record.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-zinc-400">Sem registros publicados.</p>
              )}
            </div>
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0d1822]/86 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
