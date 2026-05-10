import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { moduleConfigs, getRouteForKind } from "@/lib/modules";
import type { RecordItem } from "@/lib/data";
import { ConfidenceBadge, RiskBadge, SecrecyBadge, StatusBadge } from "@/components/badges";
import { compactText, formatDate } from "@/lib/utils";

export function RecordCard({ record, admin = false }: { record: RecordItem; admin?: boolean }) {
  const route = getRouteForKind(record.kind);
  const href = admin ? `/admin/${route}/${record.id}/editar` : `/${route}/${record.slug}`;
  const cover = record.assets.find((asset) => asset.id === record.cover_asset_id) ?? record.assets[0];

  return (
    <article className="group rounded-md border border-white/10 bg-[#0d1822]/86 p-3 shadow-[0_0_0_1px_rgba(148,163,184,0.04)] transition hover:border-cyan-200/35 hover:bg-[#101d28]">
      <Link href={href} className="grid gap-4 sm:grid-cols-[112px_1fr]">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded border border-white/10 bg-white/[0.04]">
          {cover?.public_url ? (
            <Image src={cover.public_url} alt="" fill className="object-cover" sizes="112px" />
          ) : (
            <FileText className="h-9 w-9 text-cyan-100/55" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/55">
              {moduleConfigs[record.kind].title}
            </span>
            <StatusBadge value={record.status} />
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold text-white">{record.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-300">
            {compactText(record.summary ?? record.description, "Sem resumo publicado.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <RiskBadge value={record.risk} />
            <SecrecyBadge value={record.secrecy} />
            <ConfidenceBadge value={record.confidence} />
          </div>
          {record.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {record.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>{formatDate(record.updated_at)}</span>
            <span className="inline-flex items-center gap-1 text-cyan-100/80">
              Abrir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
