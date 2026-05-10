import { AlertTriangle } from "lucide-react";

export function SetupNotice({ reason }: { reason: string }) {
  return (
    <section className="rounded-md border border-amber-200/25 bg-amber-300/10 p-5 text-amber-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-200" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Configuracao pendente</h2>
          <p className="mt-2 text-sm leading-6 text-amber-100/85">{reason}</p>
          <p className="mt-3 text-sm leading-6 text-amber-100/70">
            Revise as credenciais privadas no ambiente do servidor e tente novamente pelo painel reservado.
          </p>
        </div>
      </div>
    </section>
  );
}
