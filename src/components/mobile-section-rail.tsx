"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Database, Gauge, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "#painel", label: "Painel", icon: Database },
  { href: "#modulos", label: "Modulos", icon: Gauge },
  { href: "#destaque", label: "Destaque", icon: ShieldCheck },
  { href: "#alertas", label: "Alertas", icon: AlertTriangle },
];

export function MobileSectionRail() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      setHidden(scrollBottom > pageHeight - 420);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <nav
      aria-label="Atalhos da pagina"
      className={cn(
        "fixed right-2 top-24 z-20 grid gap-1 rounded-md border border-cyan-200/20 bg-[#07121c]/92 p-1 shadow-[0_0_28px_rgba(0,0,0,0.38)] backdrop-blur transition sm:hidden",
        hidden && "pointer-events-none translate-x-12 opacity-0",
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="lua-pressable grid h-8 w-8 place-items-center rounded border border-transparent text-cyan-100/70 transition hover:border-cyan-200/25 hover:bg-cyan-200/10 hover:text-cyan-50"
            aria-label={item.label}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}
