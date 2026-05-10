import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Database,
  FileClock,
  Gauge,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { moduleIcons } from "@/components/icons";
import { RecordCard } from "@/components/record-card";
import { LocalReadingPanel } from "@/components/reader-controls";
import { SearchPanel } from "@/components/search-panel";
import { fetchDashboardStats, fetchRecords, fetchTags, isSupabaseConfigured } from "@/lib/data";
import { moduleConfigs, recordKinds } from "@/lib/modules";
import { formatDate } from "@/lib/utils";

export default async function Home() {
  const [stats, recent, featured, tags] = await Promise.all([
    fetchDashboardStats(true),
    fetchRecords({ publicOnly: true, limit: 5 }),
    fetchRecords({ publicOnly: true, limit: 12 }),
    fetchTags(true),
  ]);

  const highlighted = featured.find((record) => record.is_featured) ?? featured[0];
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-white/10 bg-[#08131d]/90 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-cyan-200/35 bg-cyan-200/10 text-cyan-50">Painel central</Badge>
            {!configured && (
              <Badge className="border-amber-200/35 bg-amber-300/10 text-amber-100">Supabase pendente</Badge>
            )}
          </div>
          <div className="mt-7">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Lua Branca
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
              Arquivo central de registros, teses, tecnicas e estruturas para consulta, cruzamento, classificacao e
              atualizacao continua.
            </p>
            <div className="mt-6 max-w-2xl">
              <SearchPanel compact />
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Metric icon={Database} label="Registros" value={stats.total} />
            <Metric icon={Gauge} label="Tecnicas" value={stats.byKind.technique} />
            <Metric icon={FileClock} label="Teses" value={stats.byKind.thesis} />
            <Metric icon={ShieldCheck} label="Simbolos" value={stats.byKind.symbol} />
            <Metric icon={AlertTriangle} label="Faccoes" value={stats.byKind.faction} />
            <Metric icon={FileClock} label="Testes recentes" value={stats.recentTests} />
          </div>
        </div>

        <aside className="relative min-h-80 overflow-hidden rounded-md border border-white/10 bg-black/35">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-65"
            src="/media/lua-branca-intro.mp4"
            poster="/media/lua-branca-cover.svg"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 technical-grid opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,11,0.9),rgba(5,7,11,0.12),rgba(5,7,11,0.78))]" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/65">Destaque monitorado</p>
            {highlighted ? (
              <Link href={`/${moduleConfigs[highlighted.kind].route}/${highlighted.slug}`} className="group mt-3 block">
                <h2 className="text-xl font-semibold text-white">{highlighted.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">{highlighted.summary}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-100">
                  Abrir registro <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Nenhum destaque publicado. O painel permanecera limpo ate o primeiro registro sair do rascunho.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {recordKinds.map((kind) => {
          const config = moduleConfigs[kind];
          const Icon = moduleIcons[kind];
          return (
            <Link
              key={kind}
              href={`/${config.route}`}
              className="group rounded-md border border-white/10 bg-[#0d1822]/86 p-4 transition hover:border-cyan-200/35 hover:bg-[#101d28]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded border border-cyan-200/25 bg-cyan-200/10">
                  <Icon className="h-5 w-5 text-cyan-100" aria-hidden />
                </span>
                <span className="font-mono text-lg text-cyan-100">{stats.byKind[kind]}</span>
              </div>
              <h2 className="mt-4 text-base font-semibold text-white">{config.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{config.phrase}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Ultimos registros adicionados</h2>
            <Link href="/buscar" className="text-sm text-cyan-100/85 hover:text-cyan-50">
              Busca global
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="grid gap-3">
              {recent.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <EmptyState title="Arquivo ainda vazio" />
          )}
        </div>

        <aside className="space-y-3">
          <Panel title="Tags em uso" icon={Hash}>
            <div className="flex flex-wrap gap-2">
              {tags
                .filter((tag) => tag.record_count > 0)
                .slice(0, 18)
                .map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/buscar?tag=${tag.slug}`}
                    className="rounded border border-cyan-200/25 bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100 hover:bg-cyan-200/15"
                  >
                    {tag.name} ({tag.record_count})
                  </Link>
                ))}
              {tags.length === 0 && <p className="text-sm text-zinc-400">Nenhuma tag publicada.</p>}
            </div>
          </Panel>
          <LocalReadingPanel />
          <Panel title="Alertas">
            <AlertLine label="Risco alto" value={stats.highRisk} tone="danger" />
            <AlertLine label="Teses incompletas" value={stats.incompleteTheses} />
            <AlertLine label="Sem classificacao" value={stats.unclassified} />
          </Panel>
          <Panel title="Estado do sistema">
            <p className="text-sm leading-6 text-zinc-300">
              Leitura publica restrita a registros publicados. Edicao e exclusao ficam no painel protegido.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
              Atualizado em {formatDate(new Date().toISOString())}
            </p>
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
        <Icon className="h-4 w-4 text-cyan-100/70" aria-hidden />
      </div>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0d1822]/86 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        {Icon && <Icon className="h-4 w-4 text-cyan-100" aria-hidden />}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function AlertLine({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 py-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-zinc-300">{label}</span>
      <span className={tone === "danger" ? "font-mono text-red-200" : "font-mono text-cyan-100"}>{value}</span>
    </div>
  );
}
