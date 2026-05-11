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
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { moduleIcons } from "@/components/icons";
import { MobileSectionRail } from "@/components/mobile-section-rail";
import { RecordCard } from "@/components/record-card";
import { LocalReadingPanel, LocalReadingStrip } from "@/components/reader-controls";
import { SearchPanel } from "@/components/search-panel";
import { fetchDashboardStats, fetchRecords, fetchTags, isSupabaseConfigured } from "@/lib/data";
import { moduleConfigs, recordKinds } from "@/lib/modules";
import { cn } from "@/lib/utils";

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
      <MobileSectionRail />
      <LocalReadingStrip />
      <section id="painel" className="grid scroll-mt-24 gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-white/10 bg-[#08131d]/90 p-4 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-cyan-200/35 bg-cyan-200/10 text-cyan-50">Painel central</Badge>
            {!configured && (
              <Badge className="border-amber-200/35 bg-amber-300/10 text-amber-100">Supabase pendente</Badge>
            )}
          </div>
          <div className="mt-4 sm:mt-7">
            <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-6xl">
              Lua Branca
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:mt-5 sm:text-base sm:leading-8">
              Arquivo central de registros, teses, tecnicas e estruturas para consulta, cruzamento, classificacao e
              atualizacao continua.
            </p>
            <div className="mt-4 max-w-2xl sm:mt-6">
              <SearchPanel compact />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Metric icon={Database} label="Registros" value={stats.total} />
            <Metric icon={Gauge} label="Tecnicas" value={stats.byKind.technique} />
            <Metric icon={FileClock} label="Teses" value={stats.byKind.thesis} />
            <Metric icon={ShieldCheck} label="Simbolos" value={stats.byKind.symbol} />
            <Metric icon={AlertTriangle} label="Faccoes" value={stats.byKind.faction} className="hidden sm:block" />
            <Metric icon={FileClock} label="Testes recentes" value={stats.recentTests} className="hidden sm:block" />
          </div>
        </div>

        <aside id="destaque" className="relative min-h-[150px] scroll-mt-24 overflow-hidden rounded-md border border-white/10 bg-black/35 sm:min-h-80">
          <video
            className="absolute inset-0 hidden h-full w-full object-cover opacity-65 sm:block"
            src="/media/lua-branca-intro.mp4"
            poster="/media/lua-branca-cover.svg"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-[url('/media/lua-branca-cover.svg')] bg-cover bg-center opacity-35 sm:hidden" />
          <div className="absolute inset-0 technical-grid opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,11,0.92),rgba(5,7,11,0.18),rgba(5,7,11,0.78))]" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/65">Destaque monitorado</p>
            {highlighted ? (
              <Link href={`/${moduleConfigs[highlighted.kind].route}/${highlighted.slug}`} className="group mt-3 block">
                <h2 className="text-base font-semibold text-white sm:text-xl">{highlighted.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-300 sm:line-clamp-3">{highlighted.summary}</p>
                <span className="mt-4 hidden items-center gap-2 text-sm text-cyan-100 sm:inline-flex">
                  Abrir registro <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ) : (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-300 sm:mt-3 sm:line-clamp-none">
                Nenhum destaque publicado. O painel permanecera limpo ate o primeiro registro sair do rascunho.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section id="modulos" className="grid scroll-mt-24 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
        {recordKinds.map((kind) => {
          const config = moduleConfigs[kind];
          const Icon = moduleIcons[kind];
          return (
            <Link
              key={kind}
              href={`/${config.route}`}
              className="lua-pressable group rounded-md border border-white/10 bg-[#0d1822]/86 p-3 transition hover:border-cyan-200/35 hover:bg-[#101d28] sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded border border-cyan-200/25 bg-cyan-200/10 sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 text-cyan-100 sm:h-5 sm:w-5" aria-hidden />
                </span>
                <span className="font-mono text-sm text-cyan-100 sm:text-lg">{stats.byKind[kind]}</span>
              </div>
              <h2 className="mt-3 text-sm font-semibold text-white sm:mt-4 sm:text-base">{config.title}</h2>
              <p className="mt-2 hidden text-sm leading-6 text-zinc-400 sm:block">{config.phrase}</p>
            </Link>
          );
        })}
      </section>

      <section id="leitura" className="grid scroll-mt-24 gap-6 lg:grid-cols-[1fr_360px]">
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
            <EmptyState
              title="Arquivo ainda vazio"
              description="Os ultimos registros aparecem aqui quando forem publicados."
              compact
            />
          )}
        </div>

        <aside id="alertas" className="scroll-mt-24 space-y-3">
          <Panel title="Tags em uso" icon={Hash} collapsible>
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
          <Panel title="Alertas" collapsible>
            <AlertLine label="Risco alto" value={stats.highRisk} tone="danger" />
            <AlertLine label="Teses incompletas" value={stats.incompleteTheses} />
            <AlertLine label="Sem classificacao" value={stats.unclassified} />
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
  className,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-white/10 bg-white/[0.035] p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 sm:text-xs sm:tracking-[0.16em]">{label}</span>
        <Icon className="h-3.5 w-3.5 text-cyan-100/70 sm:h-4 sm:w-4" aria-hidden />
      </div>
      <p className="mt-2 font-mono text-2xl text-white sm:mt-3 sm:text-3xl">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  icon: Icon,
  collapsible = false,
}: {
  title: string;
  children: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  collapsible?: boolean;
}) {
  if (collapsible) {
    return (
      <>
        <details className="group rounded-md border border-white/10 bg-[#0d1822]/86 sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {Icon && <Icon className="h-4 w-4 text-cyan-100" aria-hidden />}
              {title}
            </span>
            <ChevronDown className="h-4 w-4 text-cyan-100/65 transition group-open:rotate-180" aria-hidden />
          </summary>
          <div className="border-t border-white/10 px-4 py-3">{children}</div>
        </details>
        <div className="hidden rounded-md border border-white/10 bg-[#0d1822]/86 p-4 sm:block">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
            {Icon && <Icon className="h-4 w-4 text-cyan-100" aria-hidden />}
            {title}
          </h2>
          <div className="mt-4">{children}</div>
        </div>
      </>
    );
  }

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
