"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BookOpen, Home, KeyRound, LockKeyhole, Search, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/buscar?level=basic", label: "Explorar", icon: Search, featured: true },
  { href: "/tags", label: "Tags", icon: Tags },
];

export function BottomNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "pin") {
      const timer = window.setTimeout(() => setOpen(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/pin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const body = (await response.json().catch(() => null)) as { redirectTo?: string; error?: string } | null;
    setLoading(false);

    if (!response.ok) {
      setError(body?.error ?? "PIN invalido.");
      return;
    }

    setOpen(false);
    router.push(body?.redirectTo ?? "/admin");
    router.refresh();
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-200/15 bg-[#06101a]/95 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_50px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded border text-[11px] transition hover:text-white",
                  link.featured
                    ? "border-cyan-200/30 bg-cyan-200/12 text-cyan-50 shadow-[0_0_22px_rgba(158,231,255,0.08)] hover:bg-cyan-200/18"
                    : "border-transparent text-zinc-300 hover:border-cyan-200/20 hover:bg-cyan-200/10",
                )}
              >
                <Icon className={cn("h-4 w-4", link.featured ? "text-cyan-50" : "text-cyan-100/80")} aria-hidden />
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setError(null);
            }}
            className="flex h-14 flex-col items-center justify-center gap-1 rounded border border-transparent text-[10px] text-zinc-500 transition hover:border-cyan-200/20 hover:bg-cyan-200/8 hover:text-cyan-100"
            aria-label="Admin"
          >
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
            Adm
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-md border border-cyan-200/25 bg-[#0b1620] p-5 shadow-[0_0_50px_rgba(125,211,252,0.12)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
                <KeyRound className="h-5 w-5 text-cyan-100" aria-hidden />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Acesso reservado</p>
                <h2 className="text-lg font-semibold text-white">Admin Lua Branca</h2>
              </div>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Senha</span>
                <input
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  inputMode="numeric"
                  autoFocus
                  autoComplete="one-time-code"
                  className="h-11 w-full rounded border border-white/10 bg-black/25 px-3 text-center font-mono text-lg tracking-[0.18em] text-white outline-none focus:border-cyan-200/45"
                  placeholder="••••••"
                  required
                />
              </label>
              {error && (
                <p className="rounded border border-red-200/35 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded border border-white/10 bg-white/[0.04] text-sm text-zinc-200 hover:bg-white/[0.07]"
                >
                  Fechar
                </button>
                <button
                  className={cn(
                    "h-10 rounded border border-cyan-200/35 bg-cyan-200/12 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 hover:bg-cyan-200/18",
                    loading && "cursor-wait opacity-60",
                  )}
                  disabled={loading}
                >
                  {loading ? "..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
