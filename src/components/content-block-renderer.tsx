import Image from "next/image";
import Link from "next/link";
import { FileText, LockKeyhole } from "lucide-react";
import type { Asset } from "@/lib/data";
import type { ContentBlock } from "@/lib/content-blocks";

export function ContentBlockRenderer({ blocks, assets }: { blocks: ContentBlock[]; assets: Asset[] }) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  if (blocks.length === 0) return null;

  return (
    <div className="reader-content space-y-5">
      {blocks.map((block) => {
        if (block.type === "heading") {
          return (
            <h2 key={block.id} className="text-2xl font-semibold text-white">
              {block.text}
            </h2>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="whitespace-pre-wrap text-zinc-300">
              {block.text}
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={block.id} className="border-l-2 border-cyan-200/50 bg-cyan-200/[0.05] px-4 py-3">
              <p className="whitespace-pre-wrap text-zinc-200">{block.text}</p>
              {block.source && <footer className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-100/65">{block.source}</footer>}
            </blockquote>
          );
        }

        if (block.type === "technical_fact") {
          return (
            <dl key={block.id} className="rounded border border-white/10 bg-black/20 p-4">
              <dt className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{block.label}</dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{block.value}</dd>
            </dl>
          );
        }

        if (block.type === "image") {
          const asset = block.assetIds[0] ? assetMap.get(block.assetIds[0]) : null;
          return <MediaFigure key={block.id} asset={asset} caption={block.caption} />;
        }

        if (block.type === "gallery") {
          const galleryAssets = block.assetIds.map((id) => assetMap.get(id)).filter(Boolean) as Asset[];
          return (
            <section key={block.id} className="space-y-3">
              {block.caption && <p className="text-sm uppercase tracking-[0.14em] text-cyan-100/70">{block.caption}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryAssets.map((asset) => (
                  <MediaFigure key={asset.id} asset={asset} />
                ))}
              </div>
            </section>
          );
        }

        const asset = block.assetIds[0] ? assetMap.get(block.assetIds[0]) : null;
        return <AttachmentBlock key={block.id} asset={asset} caption={block.caption} />;
      })}
    </div>
  );
}

function MediaFigure({ asset, caption }: { asset?: Asset | null; caption?: string }) {
  if (!asset?.public_url) {
    return (
      <div className="grid min-h-48 place-items-center rounded border border-white/10 bg-black/20 p-4 text-center">
        <div>
          <LockKeyhole className="mx-auto h-6 w-6 text-zinc-500" aria-hidden />
          <p className="mt-3 text-sm text-zinc-400">Midia restrita ou sem arquivo publicado.</p>
        </div>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded border border-white/10 bg-black/20">
      <div className="relative aspect-[16/10]">
        <Image src={asset.public_url} alt={caption ?? asset.filename} fill className="object-cover" sizes="(min-width: 768px) 640px, 100vw" />
      </div>
      {(caption || asset.filename) && (
        <figcaption className="border-t border-white/10 px-3 py-2 text-xs text-zinc-400">
          {caption ?? asset.filename}
        </figcaption>
      )}
    </figure>
  );
}

function AttachmentBlock({ asset, caption }: { asset?: Asset | null; caption?: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-cyan-200/25 bg-cyan-200/10">
          <FileText className="h-5 w-5 text-cyan-100" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100">{caption ?? asset?.filename ?? "Anexo"}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
            {asset?.mime_type ?? "arquivo"} {asset?.visibility === "private" ? "- restrito" : ""}
          </p>
          {asset?.public_url && (
            <Link href={asset.public_url} className="mt-3 inline-flex text-sm text-cyan-100 hover:text-cyan-50">
              Abrir anexo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
