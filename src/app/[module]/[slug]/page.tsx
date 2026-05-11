import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon, Link2, Paperclip, Tags } from "lucide-react";
import { ConfidenceBadge, RiskBadge, SecrecyBadge, StatusBadge } from "@/components/badges";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { ReaderControls } from "@/components/reader-controls";
import { RecordCard } from "@/components/record-card";
import { RecordTabs } from "@/components/record-tabs";
import { SafeAssetImage } from "@/components/safe-asset-image";
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

  const blockAssetIds = new Set(
    record.content_blocks.flatMap((block) => ("assetIds" in block ? block.assetIds : [])),
  );
  const images = record.assets.filter((asset) => asset.asset_type !== "attachment" && asset.public_url && !blockAssetIds.has(asset.id));
  const cover = images.find((asset) => asset.id === record.cover_asset_id) ?? images[0];
  const attachments = record.assets.filter((asset) => asset.asset_type === "attachment" && !isPdfAsset(asset) && !blockAssetIds.has(asset.id));
  const metadataEntries = Object.entries(record.metadata).filter(([, value]) => value);
  const hasBlocks = record.content_blocks.length > 0;
  const mediaCount = images.length + attachments.length;

  return (
    <article className="space-y-5 sm:space-y-6">
      <Link href={`/${module}`} className="inline-flex items-center gap-2 text-sm text-cyan-100/80 transition hover:text-cyan-50">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para {moduleConfigs[kind].title}
      </Link>

      <section className="reader-chrome overflow-hidden rounded-md border border-white/10 bg-[#0b1620]/90">
        {cover?.public_url && (
          <div
            className="reader-cover h-44 border-b border-white/10 bg-cover bg-center sm:h-64"
            style={{ backgroundImage: `url(${cover.public_url})` }}
          />
        )}
        <div className="p-4 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={record.status} />
            <RiskBadge value={record.risk} />
            <SecrecyBadge value={record.secrecy} />
            <ConfidenceBadge value={record.confidence} />
          </div>
          <h1 className="mt-4 max-w-4xl text-2xl font-semibold text-white sm:mt-5 sm:text-5xl">{record.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:mt-4 sm:text-base sm:leading-8">
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

      <RecordTabs
        counts={{
          content: hasBlocks || record.description ? 1 : 0,
          data: metadataEntries.length + record.tags.length,
          media: mediaCount,
          relations: record.relations.length,
        }}
        content={
          <TabShell icon={FileText} title="Texto principal">
            {hasBlocks ? (
              <ContentBlockRenderer blocks={record.content_blocks} assets={record.assets} />
            ) : (
              <p className="reader-content whitespace-pre-wrap text-zinc-300">
                {compactText(record.description, "Descricao completa ainda nao publicada.")}
              </p>
            )}
          </TabShell>
        }
        data={
          <TabShell icon={Tags} title="Dados tecnicos e marcadores">
            <dl className="grid gap-3 md:grid-cols-2">
              <Info label="Modulo" value={moduleConfigs[kind].title} />
              <Info label="Categoria" value={record.category ?? "Sem categoria"} />
              <Info label="Atualizado" value={formatDate(record.updated_at)} />
              <Info label="Publicado" value={formatDate(record.published_at)} />
              {metadataEntries.map(([key, value]) => (
                <Info key={key} label={labelize(key)} value={String(value)} multiline />
              ))}
            </dl>
            <div className="mt-4 rounded border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {record.tags.length > 0 ? (
                  record.tags.map((tag) => (
                    <span key={tag} className="rounded border border-cyan-200/25 bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400">Nenhuma tag registrada.</span>
                )}
              </div>
            </div>
          </TabShell>
        }
        media={
          <TabShell icon={ImageIcon} title="Midia visual">
            {mediaCount > 0 ? (
              <div className="space-y-5">
                {images.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {images.map((asset) => (
                      <figure key={asset.id} className="lua-pressable overflow-hidden rounded border border-white/10 bg-black/20">
                        <div className="relative aspect-[4/3]">
                          <SafeAssetImage
                            src={asset.public_url}
                            alt="Midia do registro"
                            className="object-cover"
                            sizes="(min-width: 768px) 420px, 100vw"
                            fallbackLabel="Midia indisponivel"
                          />
                        </div>
                      </figure>
                    ))}
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="grid gap-3">
                    {attachments.map((asset) => (
                      <div key={asset.id} className="rounded border border-white/10 bg-black/20 p-3">
                        <p className="text-sm text-zinc-200">Anexo publicado</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                          {asset.mime_type ?? "arquivo"} - {asset.visibility === "public" ? "publico" : "restrito"}
                        </p>
                        {asset.public_url && (
                          <Link href={asset.public_url} className="mt-3 inline-flex text-sm text-cyan-100 transition hover:text-cyan-50">
                            Abrir anexo
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyTab icon={Paperclip} text="Nenhuma midia ou anexo publicado neste registro." />
            )}
          </TabShell>
        }
        relations={
          <TabShell icon={Link2} title="Registros relacionados">
            {record.relations.length > 0 ? (
              <div className="grid gap-3">
                {record.relations.map((relation) => (
                  <RecordCard key={relation.record.id} record={{ ...relation.record, description: null, category: null, confidence: "media", status: "publicado", is_published: true, is_featured: false, metadata: {}, content_blocks: [], cover_asset_id: null, created_at: "", updated_at: "", published_at: "", tags: [], assets: [], relations: [] }} />
                ))}
              </div>
            ) : (
              <EmptyTab icon={Link2} text="Nenhuma relacao publicada." />
            )}
          </TabShell>
        }
      />
    </article>
  );
}

function isPdfAsset(asset: { filename: string; mime_type: string | null }) {
  return asset.mime_type === "application/pdf" || asset.filename.toLowerCase().endsWith(".pdf");
}

function TabShell({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        <Icon className="h-4 w-4 text-cyan-100" aria-hidden />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyTab({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded border border-white/10 bg-black/20 p-5 text-center">
      <div>
        <Icon className="mx-auto h-6 w-6 text-cyan-100/55" aria-hidden />
        <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
      </div>
    </div>
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
