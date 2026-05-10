import { labelize, type ConfidenceLevel, type RecordStatus, type RiskLevel, type SecrecyLevel } from "@/lib/modules";
import { cn } from "@/lib/utils";

const riskClass: Record<RiskLevel, string> = {
  baixo: "border-sky-300/35 bg-sky-300/10 text-sky-100",
  medio: "border-silver/25 bg-zinc-300/10 text-zinc-100",
  alto: "border-red-300/35 bg-red-500/10 text-red-100",
  critico: "border-red-300/60 bg-red-500/20 text-red-50",
};

const secrecyClass: Record<SecrecyLevel, string> = {
  publico_interno: "border-cyan-200/30 bg-cyan-300/10 text-cyan-100",
  restrito: "border-zinc-300/25 bg-zinc-300/10 text-zinc-100",
  sigiloso: "border-blue-200/35 bg-blue-300/10 text-blue-100",
  critico: "border-red-300/45 bg-red-500/15 text-red-50",
};

const confidenceClass: Record<ConfidenceLevel, string> = {
  baixa: "border-zinc-400/25 bg-zinc-500/10 text-zinc-200",
  media: "border-cyan-200/25 bg-cyan-300/10 text-cyan-100",
  alta: "border-sky-200/35 bg-sky-300/10 text-sky-100",
  validada: "border-emerald-200/35 bg-emerald-300/10 text-emerald-100",
};

const statusClass: Record<RecordStatus, string> = {
  rascunho: "border-zinc-400/25 bg-zinc-500/10 text-zinc-200",
  em_estudo: "border-cyan-200/30 bg-cyan-300/10 text-cyan-100",
  incompleto: "border-amber-200/35 bg-amber-300/10 text-amber-100",
  validado_parcialmente: "border-emerald-200/30 bg-emerald-300/10 text-emerald-100",
  contestado: "border-red-200/30 bg-red-400/10 text-red-100",
  abandonado: "border-zinc-400/20 bg-zinc-600/10 text-zinc-300",
  restrito: "border-blue-200/30 bg-blue-300/10 text-blue-100",
  publicado: "border-emerald-200/35 bg-emerald-300/10 text-emerald-100",
};

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ value }: { value: RiskLevel }) {
  return <Badge className={riskClass[value]}>{labelize(value)}</Badge>;
}

export function SecrecyBadge({ value }: { value: SecrecyLevel }) {
  return <Badge className={secrecyClass[value]}>{labelize(value)}</Badge>;
}

export function ConfidenceBadge({ value }: { value: ConfidenceLevel }) {
  return <Badge className={confidenceClass[value]}>{labelize(value)}</Badge>;
}

export function StatusBadge({ value }: { value: RecordStatus }) {
  return <Badge className={statusClass[value]}>{labelize(value)}</Badge>;
}
