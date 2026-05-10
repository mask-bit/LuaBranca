import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { FilterSummary } from "@/components/filter-summary";
import { RecordCard } from "@/components/record-card";
import { SearchPanel } from "@/components/search-panel";
import { fetchRecords, fetchTags } from "@/lib/data";
import { parseRecordFilters } from "@/lib/filter-params";
import { getKindFromRoute, moduleConfigs } from "@/lib/modules";

type PageProps = {
  params: Promise<{ module: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminModulePage({ params, searchParams }: PageProps) {
  const { module } = await params;
  const values = await searchParams;
  const kind = getKindFromRoute(module);
  if (!kind) notFound();

  const [records, tags] = await Promise.all([
    fetchRecords(parseRecordFilters(values, { kind, publicOnly: false, admin: true, limit: 200 })),
    fetchTags(false),
  ]);
  const config = moduleConfigs[kind];
  const gridView = values.view === "grid";

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-md border border-white/10 bg-[#0b1620]/90 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Modulo admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{config.title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{config.subtitle}</p>
        </div>
        <Link
          href={`/admin/${module}/novo`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Novo
        </Link>
      </header>

      <SearchPanel action={`/admin/${module}`} defaultValues={values} tags={tags} admin />
      <FilterSummary params={values} basePath={`/admin/${module}`} total={records.length} />

      {records.length > 0 ? (
        <section className={gridView ? "grid gap-3 lg:grid-cols-2" : "grid gap-3"}>
          {records.map((record) => (
            <RecordCard key={record.id} record={record} admin />
          ))}
        </section>
      ) : (
        <EmptyState
          title={`Nenhum item em ${config.title}`}
          description="Use o botao Novo para cadastrar o primeiro registro deste modulo."
        />
      )}
    </div>
  );
}
