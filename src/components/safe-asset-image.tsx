"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SafeAssetImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  fallbackLabel?: string;
  fallbackKind?: "image" | "file";
};

export function SafeAssetImage({
  src,
  alt,
  sizes,
  className,
  fallbackLabel = "Midia indisponivel",
  fallbackKind = "image",
}: SafeAssetImageProps) {
  const [failed, setFailed] = useState(false);
  const Icon = fallbackKind === "file" ? FileText : ImageIcon;

  if (src && !failed) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="absolute inset-0 grid place-items-center bg-white/[0.035]">
      <div className="absolute inset-0 technical-grid opacity-25" />
      <div className="relative text-center">
        <Icon className="mx-auto h-7 w-7 text-cyan-100/55" aria-hidden />
        <p className={cn("mt-2 px-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500", !fallbackLabel && "sr-only")}>
          {fallbackLabel}
        </p>
      </div>
    </div>
  );
}
