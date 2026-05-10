import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/record-form";
import { fetchRecords, fetchTags } from "@/lib/data";
import { getKindFromRoute, moduleConfigs } from "@/lib/modules";

type PageProps = {
  params: Promise<{ module: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewRecordPage({ params, searchParams }: PageProps) {
  const { module } = await params;
  const values = await searchParams;
  const kind = getKindFromRoute(module);
  if (!kind) notFound();

  const [allRecords, allTags] = await Promise.all([
    fetchRecords({ publicOnly: false, limit: 500 }),
    fetchTags(false),
  ]);

  return (
    <div className="space-y-5">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Novo registro</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{moduleConfigs[kind].singular}</h1>
      </header>
      <RecordForm
        kind={kind}
        allRecords={allRecords}
        allTags={allTags}
        error={typeof values.error === "string" ? values.error : null}
      />
    </div>
  );
}
