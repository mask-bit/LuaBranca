import Link from "next/link";
import { AlertTriangle, BookOpen, GitCompare, SearchCode } from "lucide-react";

const intents = [
  {
    label: "Ler",
    description: "Conteudo aberto e recente",
    href: "/buscar?level=basic&view=list&order=updated_desc",
    icon: BookOpen,
  },
  {
    label: "Investigar",
    description: "Estudos e registros em analise",
    href: "/buscar?level=technical&status=em_estudo&order=updated_desc",
    icon: SearchCode,
  },
  {
    label: "Comparar",
    description: "Grade para cruzar itens",
    href: "/buscar?level=complete&view=grid&order=title_asc",
    icon: GitCompare,
  },
  {
    label: "Risco",
    description: "Registros de alerta alto",
    href: "/buscar?level=technical&risk=alto&order=updated_desc",
    icon: AlertTriangle,
  },
];

export function SearchIntents() {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {intents.map((intent) => {
        const Icon = intent.icon;

        return (
          <Link
            key={intent.label}
            href={intent.href}
            className="lua-pressable rounded-md border border-white/10 bg-[#0d1822]/78 p-3 transition hover:border-cyan-200/35 hover:bg-[#101d28]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="grid h-8 w-8 place-items-center rounded border border-cyan-200/25 bg-cyan-200/10">
                <Icon className="h-4 w-4 text-cyan-100" aria-hidden />
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/55">Atalho</span>
            </div>
            <h2 className="mt-3 text-sm font-semibold text-white">{intent.label}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{intent.description}</p>
          </Link>
        );
      })}
    </section>
  );
}
