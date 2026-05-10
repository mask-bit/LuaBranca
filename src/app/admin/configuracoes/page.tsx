import { BookOpen, MonitorCog, Palette, ShieldCheck } from "lucide-react";

const preferences = [
  {
    icon: BookOpen,
    title: "Leitura",
    text: "Os leitores podem ajustar foco, tamanho do texto, favoritos e historico local sem criar conta.",
  },
  {
    icon: Palette,
    title: "Conteudo",
    text: "O editor usa blocos visuais para montar texto, imagens, galerias, dados tecnicos e anexos.",
  },
  {
    icon: MonitorCog,
    title: "Publicacao",
    text: "Rascunhos ficam no painel; apenas registros publicados aparecem nas areas publicas.",
  },
  {
    icon: ShieldCheck,
    title: "Seguranca",
    text: "Detalhes operacionais e segredos ficam fora da interface e dos arquivos publicos.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-white/10 bg-[#0b1620]/90 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Preferencias</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Configuracoes do arquivo</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
          Ajustes de experiencia e operacao do Lua Branca. Informacoes sensiveis de ambiente nao sao exibidas aqui.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {preferences.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-cyan-200/25 bg-cyan-200/10">
                <Icon className="h-5 w-5 text-cyan-100" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
