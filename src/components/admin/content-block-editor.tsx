"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, FileText, ImageIcon, ListPlus, Paperclip, Plus, Quote, Trash2, Type } from "lucide-react";
import type { Asset } from "@/lib/data";
import { createEmptyContentBlock, type ContentBlock, type ContentBlockType } from "@/lib/content-blocks";

const blockOptions: Array<{ type: ContentBlockType; label: string; icon: typeof Type }> = [
  { type: "heading", label: "Titulo", icon: Type },
  { type: "paragraph", label: "Texto", icon: FileText },
  { type: "quote", label: "Citacao", icon: Quote },
  { type: "technical_fact", label: "Dado", icon: ListPlus },
  { type: "image", label: "Imagem", icon: ImageIcon },
  { type: "gallery", label: "Galeria", icon: ImageIcon },
  { type: "attachment", label: "Anexo", icon: Paperclip },
];

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ContentBlockEditor({
  initialBlocks,
  assets,
}: {
  initialBlocks: ContentBlock[];
  assets: Asset[];
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialBlocks.length > 0 ? initialBlocks : [createEmptyContentBlock("paragraph", makeId())],
  );
  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset])), [assets]);

  function addBlock(type: ContentBlockType) {
    setBlocks((current) => [...current, createEmptyContentBlock(type, makeId())]);
  }

  function updateBlock(id: string, patch: Partial<ContentBlock>) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? ({ ...block, ...patch } as ContentBlock) : block)),
    );
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function removeBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="content_blocks" value={JSON.stringify(blocks)} />

      <div className="flex flex-wrap gap-2">
        {blockOptions.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="inline-flex h-9 items-center gap-2 rounded border border-cyan-200/25 bg-cyan-200/10 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-50 hover:bg-cyan-200/15"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <article key={block.id} className="rounded border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Bloco {index + 1} - {blockOptions.find((option) => option.type === block.type)?.label}
              </span>
              <div className="flex gap-1">
                <IconButton label="Subir" onClick={() => moveBlock(block.id, -1)} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </IconButton>
                <IconButton label="Descer" onClick={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1}>
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </IconButton>
                <IconButton label="Remover" onClick={() => removeBlock(block.id)} danger>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </IconButton>
              </div>
            </div>

            <div className="mt-3">
              {block.type === "heading" && (
                <Input value={block.text} label="Titulo do bloco" onChange={(text) => updateBlock(block.id, { text })} />
              )}
              {block.type === "paragraph" && (
                <Textarea value={block.text} label="Texto" onChange={(text) => updateBlock(block.id, { text })} />
              )}
              {block.type === "quote" && (
                <div className="grid gap-3 md:grid-cols-[1fr_240px]">
                  <Textarea value={block.text} label="Citacao" onChange={(text) => updateBlock(block.id, { text })} />
                  <Input value={block.source ?? ""} label="Fonte" onChange={(source) => updateBlock(block.id, { source })} />
                </div>
              )}
              {block.type === "technical_fact" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={block.label} label="Rotulo" onChange={(label) => updateBlock(block.id, { label })} />
                  <Input value={block.value} label="Valor" onChange={(value) => updateBlock(block.id, { value })} />
                </div>
              )}
              {(block.type === "image" || block.type === "gallery" || block.type === "attachment") && (
                <MediaBlock block={block} assetMap={assetMap} updateBlock={updateBlock} />
              )}
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addBlock("paragraph")}
        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-4 text-sm text-zinc-200 hover:bg-white/[0.07]"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Adicionar texto
      </button>
    </div>
  );
}

function MediaBlock({
  block,
  assetMap,
  updateBlock,
}: {
  block: Extract<ContentBlock, { type: "image" | "gallery" | "attachment" }>;
  assetMap: Map<string, Asset>;
  updateBlock: (id: string, patch: Partial<ContentBlock>) => void;
}) {
  const accept = block.type === "attachment" ? ".pdf,.txt,.md,.doc,.docx,image/*,application/pdf" : "image/*";
  const label = block.type === "attachment" ? "Arquivo" : block.type === "gallery" ? "Imagens" : "Imagem";

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
        <input
          name={`block_asset_${block.id}`}
          type="file"
          accept={accept}
          multiple={block.type === "gallery"}
          className="block w-full rounded border border-white/10 bg-black/20 p-3 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-200/15 file:px-3 file:py-2 file:text-cyan-50"
        />
      </label>
      {block.assetIds.length > 0 && (
        <div className="rounded border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Arquivos salvos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {block.assetIds.map((assetId) => (
              <span key={assetId} className="rounded border border-cyan-200/20 bg-cyan-200/10 px-2 py-1 text-xs text-cyan-50">
                {assetMap.get(assetId)?.filename ?? "arquivo salvo"}
              </span>
            ))}
          </div>
        </div>
      )}
      <Input value={block.caption ?? ""} label="Legenda" onChange={(caption) => updateBlock(block.id, { caption })} />
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/45"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <textarea
        value={value}
        rows={6}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/45"
      />
    </label>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={
        danger
          ? "grid h-8 w-8 place-items-center rounded border border-red-200/25 bg-red-500/10 text-red-100 disabled:cursor-not-allowed disabled:opacity-35"
          : "grid h-8 w-8 place-items-center rounded border border-white/10 bg-white/[0.04] text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
      }
    >
      {children}
    </button>
  );
}
