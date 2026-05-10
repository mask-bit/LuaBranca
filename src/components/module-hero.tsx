import Image from "next/image";
import { moduleConfigs, type RecordKind } from "@/lib/modules";
import { moduleIcons } from "@/components/icons";

export function ModuleHero({ kind }: { kind: RecordKind }) {
  const config = moduleConfigs[kind];
  const Icon = moduleIcons[kind];

  return (
    <section className="overflow-hidden rounded-md border border-white/10 bg-[#0b1620]/88">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10">
              <Icon className="h-5 w-5 text-cyan-100" aria-hidden />
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">Modulo classificado</span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{config.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">{config.subtitle}</p>
        </div>
        <div className="relative min-h-52 border-t border-white/10 bg-black/25 lg:border-l lg:border-t-0">
          <Image src="/media/lua-branca-cover.svg" alt="" fill className="object-cover opacity-70" priority />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,22,32,0.15),rgba(11,22,32,0.8))]" />
          <p className="absolute bottom-5 left-5 right-5 text-xs uppercase tracking-[0.18em] text-cyan-100/70">
            {config.coverHint}
          </p>
        </div>
      </div>
    </section>
  );
}
