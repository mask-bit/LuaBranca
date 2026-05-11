import Image from "next/image";
import { moduleConfigs, type RecordKind } from "@/lib/modules";
import { moduleIcons } from "@/components/icons";

export function ModuleHero({ kind }: { kind: RecordKind }) {
  const config = moduleConfigs[kind];
  const Icon = moduleIcons[kind];

  return (
    <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#0b1620]/88">
      <div className="absolute inset-0 bg-[url('/media/lua-branca-cover.svg')] bg-cover bg-center opacity-15 sm:hidden" />
      <div className="relative grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-4 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded border border-cyan-200/30 bg-cyan-200/10 sm:h-11 sm:w-11">
              <Icon className="h-4 w-4 text-cyan-100 sm:h-5 sm:w-5" aria-hidden />
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/60 sm:text-xs sm:tracking-[0.2em]">
              Modulo classificado
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:mt-5 sm:text-4xl">{config.title}</h1>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-300 sm:mt-3 sm:line-clamp-none sm:text-base sm:leading-7">
            {config.subtitle}
          </p>
        </div>
        <div className="relative hidden min-h-52 border-t border-white/10 bg-black/25 sm:block lg:border-l lg:border-t-0">
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
