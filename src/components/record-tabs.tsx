"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Database, FileText, ImageIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "content" | "data" | "media" | "relations";

const tabs: Array<{
  id: TabId;
  label: string;
  icon: typeof FileText;
}> = [
  { id: "content", label: "Conteudo", icon: FileText },
  { id: "data", label: "Dados", icon: Database },
  { id: "media", label: "Midia", icon: ImageIcon },
  { id: "relations", label: "Relacoes", icon: Link2 },
];

export function RecordTabs({
  content,
  data,
  media,
  relations,
  counts,
}: {
  content: ReactNode;
  data: ReactNode;
  media: ReactNode;
  relations: ReactNode;
  counts: Record<TabId, number>;
}) {
  const [active, setActive] = useState<TabId>("content");
  const panels: Record<TabId, ReactNode> = { content, data, media, relations };
  const activeIndex = tabs.findIndex((tab) => tab.id === active);

  return (
    <section className="reader-layout reader-tabs-shell space-y-3">
      <div className="sticky top-[65px] z-20 rounded-md border border-cyan-200/15 bg-[#07121c]/95 p-1 shadow-[0_14px_40px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="relative grid grid-cols-4 gap-1" role="tablist" aria-label="Secoes do registro">
          <span
            className="lua-tab-indicator pointer-events-none absolute bottom-0 left-0 top-0 z-0 w-1/4 rounded border border-cyan-200/40 bg-cyan-200/15 shadow-[0_0_24px_rgba(158,231,255,0.08)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
            aria-hidden
          />
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`record-tab-${tab.id}`}
                onClick={() => {
                  if (!selected) setActive(tab.id);
                }}
                className={cn(
                  "lua-pressable relative z-10 flex h-11 min-w-0 items-center justify-center gap-1.5 rounded border px-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition sm:h-12 sm:text-xs",
                  selected
                    ? "border-transparent text-cyan-50"
                    : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                <span className="truncate">{tab.label}</span>
                {counts[tab.id] > 0 && (
                  <span className="hidden font-mono text-[10px] text-cyan-100/70 sm:inline">
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div key={active} id={`record-tab-${active}`} className="lua-tab-panel" role="tabpanel">
        {panels[active]}
      </div>
    </section>
  );
}
