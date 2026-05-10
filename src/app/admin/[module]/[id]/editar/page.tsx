import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/record-form";
import { getAdminContext } from "@/lib/auth";
import { fetchRecordById, fetchRecords, fetchTags } from "@/lib/data";
import { getKindFromRoute, moduleConfigs } from "@/lib/modules";

type PageProps = {
  params: Promise<{ module: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditRecordPage({ params, searchParams }: PageProps) {
  const { module, id } = await params;
  const values = await searchParams;
  const kind = getKindFromRoute(module);
  if (!kind) notFound();

  const [record, allRecords, allTags, context] = await Promise.all([
    fetchRecordById(id),
    fetchRecords({ publicOnly: false, limit: 500 }),
    fetchTags(false),
    getAdminContext(2, `/admin/${module}/${id}/editar`),
  ]);

  if (!record || record.kind !== kind) notFound();

  const canDelete =
    context.configured &&
    !context.forbidden &&
    (context.authMethod === "pin" || (context.profile?.access_level ?? 0) >= 4);

  return (
    <div className="space-y-5">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Editar {moduleConfigs[kind].singular}</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{record.title}</h1>
      </header>
      <RecordForm
        kind={kind}
        record={record}
        allRecords={allRecords}
        allTags={allTags}
        canDelete={canDelete}
        error={typeof values.error === "string" ? values.error : null}
      />
    </div>
  );
}
