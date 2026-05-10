"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";

export function AdminPinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    router.push(body?.redirectTo ?? "/admin");
    router.refresh();
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center">
      <div className="w-full rounded-md border border-white/10 bg-[#0b1620]/92 p-6 shadow-[0_0_40px_rgba(125,211,252,0.08)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
            <LockKeyhole className="h-5 w-5 text-cyan-100" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Painel reservado</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Admin Lua Branca</h1>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Senha do painel</span>
            <span className="relative block">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-11 w-full rounded border border-white/10 bg-black/25 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-200/45"
                placeholder="Senha atual"
                required
              />
            </span>
          </label>
          <button
            disabled={loading}
            className="h-11 w-full rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Verificando" : "Entrar"}
          </button>
        </form>

        {error && (
          <p className="mt-5 rounded border border-red-200/35 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>
        )}
      </div>
    </section>
  );
}
