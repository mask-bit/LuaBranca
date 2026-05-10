import { EmptyState } from "@/components/empty-state";
import { FilterSummary } from "@/components/filter-summary";
import { RecordCard } from "@/components/record-card";
import { SearchPanel } from "@/components/search-panel";
import { fetchRecords, fetchTags } from "@/lib/data";
import { parseRecordFilters } from "@/lib/filter-params";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const values = await searchParams;
  const q = typeof values.q === "string" ? values.q : "";
  const gridView = values.view === "grid";
  const [records, tags] = await Promise.all([
    fetchRecords(parseRecordFilters(values, { publicOnly: true, limit: 100 })),
    fetchTags(true),
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Sistema de consulta</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Busca global</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
          Pesquise por nome, palavra-chave, tecnica, simbolo, faccao, tese, conhecimento, risco ou origem.
        </p>
      </header>

      <SearchPanel defaultValues={values} tags={tags} />
      <FilterSummary params={values} basePath="/buscar" total={records.length} />

      {records.length > 0 ? (
        <section className={gridView ? "grid gap-3 lg:grid-cols-2" : "grid gap-3"}>
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </section>
      ) : (
        <EmptyState
          title={q ? "Nenhum resultado para a consulta" : "Digite uma consulta"}
          description="A busca global consultara apenas registros publicados e liberados para leitura publica."
        />
      )}
    </div>
  );
}
