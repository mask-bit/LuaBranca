import type { ComponentType } from "react";
import { KeyRound, ServerCog, ShieldCheck } from "lucide-react";

export function AdminAccessGuide({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-md border border-cyan-200/20 bg-cyan-200/[0.06] p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
          <KeyRound className="h-5 w-5 text-cyan-100" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Acesso por PIN</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            O admin usa uma senha local e grava dados apenas por rotas protegidas no servidor.
          </p>
          <div className={compact ? "mt-3 space-y-2" : "mt-4 grid gap-3 md:grid-cols-3"}>
            <Step icon={KeyRound} title="1. Botao Admin" text="Abra o botao Admin na barra inferior." />
            <Step icon={ShieldCheck} title="2. Senha" text="Digite a senha atual do painel." />
            <Step icon={ServerCog} title="3. Servidor" text="As gravacoes acontecem em chamadas protegidas." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-100" aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-100">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  );
}
