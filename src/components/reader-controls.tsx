"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Bookmark, History, Minus, Plus } from "lucide-react";

type LocalRecord = {
  id: string;
  title: string;
  href: string;
  summary?: string | null;
  updatedAt: string;
};

type ReaderPrefs = {
  fontScale: number;
  focus: boolean;
};

const savedKey = "lua-branca:savedRecords";
const recentKey = "lua-branca:recentReads";
const prefsKey = "lua-branca:readerPrefs";

function readList(key: string): LocalRecord[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, records: LocalRecord[]) {
  localStorage.setItem(key, JSON.stringify(records.slice(0, 24)));
}

function readPrefs(): ReaderPrefs {
  try {
    const value = localStorage.getItem(prefsKey);
    return value ? { fontScale: 1, focus: false, ...JSON.parse(value) } : { fontScale: 1, focus: false };
  } catch {
    return { fontScale: 1, focus: false };
  }
}

function applyPrefs(prefs: ReaderPrefs) {
  document.documentElement.style.setProperty("--lua-reader-font-size", `${Math.round(14 * prefs.fontScale)}px`);
  document.documentElement.dataset.luaReaderFocus = prefs.focus ? "true" : "false";
}

export function ReaderControls({ record }: { record: LocalRecord }) {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<ReaderPrefs>({ fontScale: 1, focus: false });

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      const initialPrefs = readPrefs();
      setPrefs(initialPrefs);
      applyPrefs(initialPrefs);

      const savedRecords = readList(savedKey);
      setSaved(savedRecords.some((item) => item.id === record.id));
    });

    const recent = readList(recentKey).filter((item) => item.id !== record.id);
    writeList(recentKey, [{ ...record, updatedAt: new Date().toISOString() }, ...recent]);

    return () => {
      active = false;
    };
  }, [record]);

  function updatePrefs(next: ReaderPrefs) {
    setPrefs(next);
    localStorage.setItem(prefsKey, JSON.stringify(next));
    applyPrefs(next);
  }

  function toggleSaved() {
    const current = readList(savedKey).filter((item) => item.id !== record.id);
    const nextSaved = !saved;
    if (nextSaved) writeList(savedKey, [{ ...record, updatedAt: new Date().toISOString() }, ...current]);
    else writeList(savedKey, current);
    setSaved(nextSaved);
  }

  return (
    <div className="rounded-md border border-white/10 bg-[#0d1822]/86 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleSaved}
          className={saved ? activeButtonClass : buttonClass}
        >
          <Bookmark className="h-4 w-4" aria-hidden />
          {saved ? "Salvo" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => updatePrefs({ ...prefs, focus: !prefs.focus })}
          className={prefs.focus ? activeButtonClass : buttonClass}
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Foco
        </button>
        <button
          type="button"
          aria-label="Diminuir texto"
          title="Diminuir texto"
          onClick={() => updatePrefs({ ...prefs, fontScale: Math.max(0.9, Number((prefs.fontScale - 0.1).toFixed(1))) })}
          className={iconButtonClass}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="px-1 font-mono text-xs text-zinc-400">{Math.round(prefs.fontScale * 100)}%</span>
        <button
          type="button"
          aria-label="Aumentar texto"
          title="Aumentar texto"
          onClick={() => updatePrefs({ ...prefs, fontScale: Math.min(1.4, Number((prefs.fontScale + 0.1).toFixed(1))) })}
          className={iconButtonClass}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function LocalReadingPanel() {
  const [saved, setSaved] = useState<LocalRecord[]>([]);
  const [recent, setRecent] = useState<LocalRecord[]>([]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSaved(readList(savedKey));
      setRecent(readList(recentKey));
    });
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    const merged = [...saved.map((item) => ({ ...item, kind: "Salvo" })), ...recent.map((item) => ({ ...item, kind: "Recente" }))];
    return merged.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 5);
  }, [saved, recent]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        <History className="h-4 w-4 text-cyan-100" aria-hidden />
        Leitura local
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className="block rounded border border-white/10 bg-black/20 p-3 hover:bg-white/[0.04]">
            <span className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/60">{item.kind}</span>
            <p className="mt-1 text-sm font-medium text-zinc-100">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

const buttonClass =
  "inline-flex h-9 items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-200 hover:bg-white/[0.07]";
const activeButtonClass =
  "inline-flex h-9 items-center gap-2 rounded border border-cyan-200/35 bg-cyan-200/12 px-3 text-sm text-cyan-50 hover:bg-cyan-200/18";
const iconButtonClass =
  "grid h-9 w-9 place-items-center rounded border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.07]";
