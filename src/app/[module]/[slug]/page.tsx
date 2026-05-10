import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon, Link2, Paperclip } from "lucide-react";
import { ConfidenceBadge, RiskBadge, SecrecyBadge, StatusBadge } from "@/components/badges";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { ReaderControls } from "@/components/reader-controls";
import { RecordCard } from "@/components/record-card";
import { fetchRecordBySlug } from "@/lib/data";
import { getKindFromRoute, labelize, moduleConfigs } from "@/lib/modules";
import { compactText, formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ module: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { module, slug } = await params;
  const kind = getKindFromRoute(module);
  if (!kind) return {};

  const record = await fetchRecordBySlug(kind, slug, true);
  return {
    title: record?.title ?? moduleConfigs[kind].singular,
    description: record?.summary ?? moduleConfigs[kind].subtitle,
  };
}

export default async function RecordPage({ params }: PageProps) {
  const { module, slug } = await params;
  const kind = getKindFromRoute(module);
  if (!kind) notFound();

  const record = await fetchRecordBySlug(kind, slug, true);
  if (!record) notFound();

  const cover = record.assets.find((asset) => asset.id === record.cover_asset_id) ?? record.assets[0];
  const blockAssetIds = new Set(
    record.content_blocks.flatMap((block) => ("assetIds" in block ? block.assetIds : [])),
  );
  const images = record.assets.filter((asset) => asset.asset_type !== "attachment" && asset.public_url && !blockAssetIds.has(asset.id));
  const attachments = record.assets.filter((asset) => asset.asset_type === "attachment" && !blockAssetIds.has(asset.id));
  const metadataEntries = Object.entries(record.metadata).filter(([, value]) => value);
  const hasBlocks = record.content_blocks.length > 0;

  return (
    <article className="space-y-6">
      <Link href={`/${module}`} className="inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-cyan-50">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para {moduleConfigs[kind].title}
      </Link>

      <section className="overflow-hidden rounded-md border border-white/10 bg-[#0b1620]/90">
        {cover?.public_url && (
          <div
            className="reader-cover h-64 border-b border-white/10 bg-cover bg-center"
            style={{ backgroundImage: `url(${cover.public_url})` }}
          />
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={record.status} />
            <RiskBadge value={record.risk} />
            <SecrecyBadge value={record.secrecy} />
            <ConfidenceBadge value={record.confidence} />
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-semibold text-white sm:text-5xl">{record.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
            {compactText(record.summary, moduleConfigs[kind].subtitle)}
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <Info label="Categoria" value={record.category ?? "Sem categoria"} />
            <Info label="Atualizado" value={formatDate(record.updated_at)} />
            <Info label="Publicado" value={formatDate(record.published_at)} />
          </dl>
        </div>
      </section>

      <ReaderControls
        record={{
          id: record.id,
          title: record.title,
          href: `/${module}/${record.slug}`,
          summary: record.summary,
          updatedAt: record.updated_at,
        }}
      />

      <section className="reader-layout grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              <FileText className="h-4 w-4 text-cyan-100" aria-hidden />
              Texto principal
            </h2>
            <div className="mt-4">
              {hasBlocks ? (
                <ContentBlockRenderer blocks={record.content_blocks} assets={record.assets} />
              ) : (
                <p className="reader-content whitespace-pre-wrap text-zinc-300">
                  {compactText(record.description, "Descricao completa ainda nao publicada.")}
                </p>
              )}
            </div>
          </section>

          {metadataEntries.length > 0 && (
            <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Dados tecnicos</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {metadataEntries.map(([key, value]) => (
                  <Info key={key} label={labelize(key)} value={String(value)} multiline />
                ))}
              </div>
            </section>
          )}

          {images.length > 0 && (
            <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                <ImageIcon className="h-4 w-4 text-cyan-100" aria-hidden />
                Imagens
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {images.map((asset) => (
                  <figure key={asset.id} className="overflow-hidden rounded border border-white/10 bg-black/20">
                    <div className="relative aspect-[4/3]">
                      <Image src={asset.public_url as string} alt="" fill className="object-cover" sizes="(min-width: 768px) 420px, 100vw" />
                    </div>
                    <figcaption className="border-t border-white/10 px-3 py-2 text-xs text-zinc-400">
                      {asset.filename}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {attachments.length > 0 && (
            <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                <Paperclip className="h-4 w-4 text-cyan-100" aria-hidden />
                Anexos
              </h2>
              <div className="mt-4 grid gap-3">
                {attachments.map((asset) => (
                  <div key={asset.id} className="rounded border border-white/10 bg-black/20 p-3">
                    <p className="text-sm text-zinc-200">{asset.filename}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                      {asset.mime_type ?? "arquivo"} - {asset.visibility === "public" ? "publico" : "restrito"}
                    </p>
                    {asset.public_url && (
                      <Link href={asset.public_url} className="mt-3 inline-flex text-sm text-cyan-100 hover:text-cyan-50">
                        Abrir anexo
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="reader-sidebar space-y-4">
          <div className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {record.tags.length > 0 ? (
                record.tags.map((tag) => (
                  <span key={tag} className="rounded border border-cyan-200/25 bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-zinc-400">Nenhuma tag registrada.</p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              <Link2 className="h-4 w-4 text-cyan-100" aria-hidden />
              Relacionados
            </h2>
            <div className="mt-4 space-y-3">
              {record.relations.length > 0 ? (
                record.relations.map((relation) => (
                  <RecordCard key={relation.record.id} record={{ ...relation.record, description: null, category: null, confidence: "media", status: "publicado", is_published: true, is_featured: false, metadata: {}, content_blocks: [], cover_asset_id: null, created_at: "", updated_at: "", published_at: "", tags: [], assets: [], relations: [] }} />
                ))
              ) : (
                <p className="text-sm leading-6 text-zinc-400">Nenhuma relacao publicada.</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </article>
  );
}

function Info({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-3">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
      <dd className={multiline ? "mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300" : "mt-2 text-sm text-zinc-200"}>
        {value}
      </dd>
    </div>
  );
}
