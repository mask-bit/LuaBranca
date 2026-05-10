import Link from "next/link";
import type { ReactNode } from "react";
import { FileUp, Gauge, Hash, LogOut, Settings, Shield, ShieldCheck } from "lucide-react";
import { moduleIcons } from "@/components/icons";
import { moduleConfigs, recordKinds } from "@/lib/modules";

const adminLinks = [
  { href: "/admin", label: "Visao geral", icon: Gauge },
  { href: "/admin/importar", label: "Importar PDF", icon: FileUp },
  { href: "/admin/tags", label: "Tags", icon: Hash },
  { href: "/admin/seguranca", label: "Seguranca", icon: ShieldCheck },
  { href: "/admin/configuracoes", label: "Configuracao", icon: Settings },
];

export function AdminChrome({
  accessLabel = "PIN admin",
  children,
}: {
  accessLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="rounded-md border border-white/10 bg-[#0b1620]/90">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
              <Shield className="h-5 w-5 text-cyan-100" aria-hidden />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Painel protegido</p>
              <h1 className="text-xl font-semibold text-white">Admin Lua Branca</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="rounded border border-white/10 bg-white/[0.04] px-3 py-2">
              {accessLabel}
            </span>
            <form action="/api/admin/pin-logout" method="post">
              <button className="inline-flex h-10 items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 text-zinc-200 hover:bg-white/[0.07]">
                <LogOut className="h-4 w-4" aria-hidden />
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-3" aria-label="Gestao admin">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded border border-white/10 bg-white/[0.035] px-3 text-sm text-zinc-300 transition hover:border-cyan-200/35 hover:text-white"
              >
                <Icon className="h-4 w-4 text-cyan-100/75" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-3" aria-label="Modulos admin">
          {recordKinds.map((kind) => {
            const config = moduleConfigs[kind];
            const Icon = moduleIcons[kind];
            return (
              <Link
                key={kind}
                href={`/admin/${config.route}`}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded border border-cyan-200/15 bg-cyan-200/[0.055] px-3 text-xs text-cyan-50/90 transition hover:border-cyan-200/35 hover:bg-cyan-200/10"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {config.title}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
