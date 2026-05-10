import { ShieldCheck } from "lucide-react";
import { AdminAccessGuide } from "@/components/admin/admin-access-guide";

const items = [
  "Leitura publica limitada a registros publicados por RLS.",
  "Edicao exige perfil autenticado com nivel 2 ou superior.",
  "Exclusao exige nivel 4.",
  "Service role fica apenas no servidor e nunca usa prefixo NEXT_PUBLIC.",
  "Eventos de criacao, edicao, publicacao, upload e exclusao ficam em audit_events.",
  "Buckets de storage separam arquivos publicos e privados.",
];

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-white/10 bg-[#0b1620]/90 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
            <ShieldCheck className="h-5 w-5 text-cyan-100" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Controle de acesso</p>
            <h1 className="text-2xl font-semibold text-white">Seguranca</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Regras principais para manter o painel protegido e os registros publicados separados dos rascunhos.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
              {item}
            </div>
          ))}
        </section>
        <AdminAccessGuide compact />
      </div>
    </div>
  );
}
