import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Paperclip } from "lucide-react";
import { moduleConfigs, getRouteForKind } from "@/lib/modules";
import type { RecordItem } from "@/lib/data";
import { ConfidenceBadge, RiskBadge, SecrecyBadge, StatusBadge } from "@/components/badges";
import { cn, compactText, formatDate } from "@/lib/utils";

export function RecordCard({ record, admin = false }: { record: RecordItem; admin?: boolean }) {
  const route = getRouteForKind(record.kind);
  const href = admin ? `/admin/${route}/${record.id}/editar` : `/${route}/${record.slug}`;
  const cover = record.assets.find((asset) => asset.id === record.cover_asset_id) ?? record.assets[0];
  const hasImage = record.assets.some((asset) => asset.asset_type !== "attachment" && asset.public_url);
  const hasAttachment = record.assets.some((asset) => asset.asset_type === "attachment");
  const hasBlockMedia = record.content_blocks.some((block) => "assetIds" in block && block.assetIds.length > 0);
  const hasMedia = hasImage || hasAttachment || hasBlockMedia;

  return (
    <article className="lua-pressable group rounded-md border border-white/10 bg-[#0d1822]/86 p-3 shadow-[0_0_0_1px_rgba(148,163,184,0.04)] transition hover:border-cyan-200/35 hover:bg-[#101d28]">
      <Link href={href} className="grid gap-4 sm:grid-cols-[112px_1fr]">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded border border-white/10 bg-white/[0.04]">
          {cover?.public_url ? (
            <Image
              src={cover.public_url}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="112px"
            />
          ) : (
            <>
              <div className="absolute inset-0 technical-grid opacity-25" />
              <FileText className="relative h-9 w-9 text-cyan-100/55" aria-hidden />
            </>
          )}
          {hasMedia && (
            <span className="absolute right-2 top-2 inline-flex h-7 items-center gap-1 rounded border border-cyan-200/30 bg-[#06101a]/85 px-2 text-[10px] uppercase tracking-[0.12em] text-cyan-100 backdrop-blur">
              {hasAttachment ? <Paperclip className="h-3 w-3" aria-hidden /> : <ImageIcon className="h-3 w-3" aria-hidden />}
              Midia
            </span>
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
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className={cn(record.risk === "alto" || record.risk === "critico" ? "" : "opacity-85")}>
              <RiskBadge value={record.risk} />
            </span>
            <span className="opacity-85">
              <SecrecyBadge value={record.secrecy} />
            </span>
            <span className="hidden opacity-85 sm:inline-flex">
              <ConfidenceBadge value={record.confidence} />
            </span>
          </div>
          {record.tags.length > 0 && (
            <div className="mt-3 flex gap-1.5 overflow-hidden">
              {record.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>{formatDate(record.updated_at)}</span>
            <span className="inline-flex h-8 items-center gap-1 rounded border border-cyan-200/20 bg-cyan-200/10 px-2 text-cyan-100/85 transition group-hover:bg-cyan-200/15 group-hover:text-cyan-50">
              Ler <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
