import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock3,
  FilePlus2,
  FileUp,
  ListFilter,
  Plus,
  Tags,
} from "lucide-react";
import { AdminAccessGuide } from "@/components/admin/admin-access-guide";
import { EmptyState } from "@/components/empty-state";
import { moduleIcons } from "@/components/icons";
import { RecordCard } from "@/components/record-card";
import { fetchAuditEvents, fetchRecords, fetchTags } from "@/lib/data";
import { moduleConfigs, recordKinds, type RecordKind } from "@/lib/modules";
import { formatDate } from "@/lib/utils";

export default async function AdminHome() {
  const [allRecords, auditEvents, tags] = await Promise.all([
    fetchRecords({ publicOnly: false, limit: 1000 }),
    fetchAuditEvents(8),
    fetchTags(false),
  ]);

  const byKind = Object.fromEntries(
    recordKinds.map((kind) => [kind, allRecords.filter((record) => record.kind === kind).length]),
  ) as Record<RecordKind, number>;

  const recentRecords = allRecords.slice(0, 6);
  const publishedCount = allRecords.filter((record) => record.is_published).length;
  const draftCount = allRecords.length - publishedCount;
  const featuredCount = allRecords.filter((record) => record.is_featured).length;
  const highRiskCount = allRecords.filter((record) => record.risk === "alto" || record.risk === "critico").length;
  const unclassifiedCount = allRecords.filter((record) => !record.category && record.tags.length === 0).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-md border border-white/10 bg-[#0b1620]/90 p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">Centro de gestao</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Arquivo administrativo</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                Controle registros, tags, publicacao, rascunhos e historico sem sair do painel protegido.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/biblioteca/novo"
                className="inline-flex h-10 items-center gap-2 rounded border border-cyan-200/35 bg-cyan-200/12 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-50 hover:bg-cyan-200/18"
              >
                <FilePlus2 className="h-4 w-4" aria-hidden />
                Novo registro
              </Link>
              <Link
                href="/admin/tags"
                className="inline-flex h-10 items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200 hover:bg-white/[0.07]"
              >
                <Tags className="h-4 w-4" aria-hidden />
                Tags
              </Link>
              <Link
                href="/admin/importar"
                className="inline-flex h-10 items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200 hover:bg-white/[0.07]"
              >
                <FileUp className="h-4 w-4" aria-hidden />
                Importar PDF
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <AdminMetric icon={Activity} label="Total" value={allRecords.length} />
            <AdminMetric icon={ArrowRight} label="Publicados" value={publishedCount} />
            <AdminMetric icon={Clock3} label="Rascunhos" value={draftCount} />
            <AdminMetric icon={Tags} label="Tags" value={tags.length} />
            <AdminMetric icon={AlertTriangle} label="Risco alto" value={highRiskCount} danger />
          </div>
        </div>

        <AdminAccessGuide compact />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {recordKinds.map((kind) => {
          const config = moduleConfigs[kind];
          const Icon = moduleIcons[kind];
          return (
            <article
              key={kind}
              className="rounded-md border border-white/10 bg-[#0d1822]/86 p-4 transition hover:border-cyan-200/35"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded border border-cyan-200/25 bg-cyan-200/10">
                  <Icon className="h-5 w-5 text-cyan-100" aria-hidden />
                </span>
                <span className="font-mono text-xl text-white">{byKind[kind]}</span>
              </div>
              <h2 className="mt-4 text-base font-semibold text-white">{config.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">{config.phrase}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/${config.route}`}
                  className="inline-flex h-9 items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 text-xs text-zinc-200 hover:bg-white/[0.07]"
                >
                  <ListFilter className="h-3.5 w-3.5" aria-hidden />
                  Gerenciar
                </Link>
                <Link
                  href={`/admin/${config.route}/novo`}
                  className="inline-flex h-9 items-center gap-2 rounded border border-cyan-200/25 bg-cyan-200/10 px-3 text-xs text-cyan-50 hover:bg-cyan-200/15"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Novo
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Registros recentes</h2>
            <span className="rounded border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
              {featuredCount} destaques monitorados
            </span>
          </div>
          {recentRecords.length > 0 ? (
            <div className="grid gap-3">
              {recentRecords.map((record) => (
                <RecordCard key={record.id} record={record} admin />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Admin sem registros"
              description="Crie o primeiro item em qualquer modulo para iniciar o arquivo."
            />
          )}
        </div>

        <aside className="space-y-3">
          <Panel title="Atencao operacional" icon={AlertTriangle}>
            <StatusLine label="Rascunhos" value={draftCount} />
            <StatusLine label="Registros sem categoria/tag" value={unclassifiedCount} />
            <StatusLine label="Risco alto ou critico" value={highRiskCount} danger />
          </Panel>

          <Panel title="Historico recente" icon={Clock3}>
            <div className="space-y-3">
              {auditEvents.length > 0 ? (
                auditEvents.map((event) => (
                  <div key={event.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                    <p className="text-sm text-zinc-200">{event.action}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDate(event.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-zinc-400">Nenhuma alteracao registrada ainda.</p>
              )}
            </div>
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function AdminMetric({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</span>
        <Icon className={danger ? "h-4 w-4 text-red-200" : "h-4 w-4 text-cyan-100/75"} aria-hidden />
      </div>
      <p className={danger ? "mt-3 font-mono text-3xl text-red-100" : "mt-3 font-mono text-3xl text-white"}>
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        <Icon className="h-4 w-4 text-cyan-100" aria-hidden />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusLine({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 py-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-zinc-300">{label}</span>
      <span className={danger ? "font-mono text-red-200" : "font-mono text-cyan-100"}>{value}</span>
    </div>
  );
}
