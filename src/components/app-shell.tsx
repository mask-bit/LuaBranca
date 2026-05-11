import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { navIcons } from "@/components/icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#06111d_0%,#081017_42%,#05070b_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[url('/media/lua-branca-cover.svg')] bg-cover bg-center opacity-[0.13]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07101a]/88 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan-200/30 bg-cyan-200/10">
              <navIcons.moon className="h-4 w-4 text-cyan-100" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold uppercase tracking-[0.22em] text-white sm:text-base">
                Lua Branca
              </span>
              <span className="hidden text-xs uppercase tracking-[0.18em] text-cyan-100/55 sm:block">
                Arquivo central
              </span>
            </span>
          </Link>
          <Link
            href="/buscar?level=basic"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/5 text-cyan-100"
            aria-label="Buscar"
          >
            <navIcons.search className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="pb-28">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:py-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
