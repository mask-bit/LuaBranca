"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { FileText, Loader2, ScanText } from "lucide-react";
import { importPdfDraftAction } from "@/lib/pdf-import-actions";
import { moduleConfigs, recordKinds } from "@/lib/modules";

const OCR_PAGE_LIMIT = 6;
const TEXT_PAGE_LIMIT = 20;

type ExtractionState = "idle" | "reading" | "ocr" | "done" | "error";

export function PdfImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ExtractionState>("idle");
  const [warning, setWarning] = useState("");

  const wordCount = useMemo(() => text.split(/\s+/).filter(Boolean).length, [text]);

  function updateFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setText("");
    setWarning("");
    setStatus("idle");

    if (nextFile) {
      const cleanName = nextFile.name.replace(/\.pdf$/i, "").replaceAll(/[_-]+/g, " ");
      setTitle(cleanName);
    }
  }

  async function extractPdf() {
    if (!file) return;

    setStatus("reading");
    setWarning("");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const documentData = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: documentData }).promise;
      const maxTextPages = Math.min(pdf.numPages, TEXT_PAGE_LIMIT);
      const textParts: string[] = [];

      for (let pageNumber = 1; pageNumber <= maxTextPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (pageText) textParts.push(pageText);
      }

      let extracted = textParts.join("\n\n").trim();

      if (extracted.length < 80) {
        setStatus("ocr");
        extracted = await runOcr(pdf, Math.min(pdf.numPages, OCR_PAGE_LIMIT));
      }

      if (pdf.numPages > TEXT_PAGE_LIMIT) {
        setWarning(`PDF com ${pdf.numPages} paginas; o MVP leu as primeiras ${TEXT_PAGE_LIMIT}.`);
      } else if (extracted.length < 80) {
        setWarning("Pouco texto extraido. Revise o rascunho antes de publicar.");
      }

      setText(extracted);
      setSummary(extracted ? `${extracted.slice(0, 300)}${extracted.length > 300 ? "..." : ""}` : "PDF importado para revisao.");
      setTags(suggestTags(extracted));
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setWarning(error instanceof Error ? error.message : "Falha ao ler PDF.");
    }
  }

  return (
    <form action={importPdfDraftAction} className="space-y-5">
      <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
          <FileText className="h-4 w-4 text-cyan-100" aria-hidden />
          PDF
        </h2>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Arquivo</span>
            <input
              name="pdf"
              type="file"
              accept="application/pdf"
              onChange={updateFile}
              required
              className="block w-full rounded border border-white/10 bg-black/20 p-3 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-200/15 file:px-3 file:py-2 file:text-cyan-50"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Modulo</span>
            <select
              name="kind"
              defaultValue="library"
              className="h-12 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan-200/45"
            >
              {recordKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {moduleConfigs[kind].title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={extractPdf}
            disabled={!file || status === "reading" || status === "ocr"}
            className="inline-flex h-11 items-center gap-2 rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18 disabled:cursor-wait disabled:opacity-60"
          >
            {status === "reading" || status === "ocr" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ScanText className="h-4 w-4" aria-hidden />
            )}
            {status === "ocr" ? "OCR em andamento" : "Ler PDF"}
          </button>
          <span className="text-sm text-zinc-400">
            {status === "done" ? `${wordCount} palavras extraidas` : status === "idle" ? "Aguardando arquivo" : ""}
          </span>
        </div>
        {warning && (
          <p className="mt-4 rounded border border-amber-200/30 bg-amber-300/10 p-3 text-sm text-amber-100">
            {warning}
          </p>
        )}
      </section>

      <section className="rounded-md border border-white/10 bg-[#0d1822]/86 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Rascunho gerado</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="title" label="Titulo" value={title} onChange={setTitle} required />
          <Input name="tags" label="Tags sugeridas" value={tags} onChange={setTags} placeholder="pdf, documento" />
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Resumo</span>
          <textarea
            name="summary"
            rows={3}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="w-full rounded border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">Texto extraido</span>
          <textarea
            name="extracted_text"
            rows={14}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="w-full rounded border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45"
          />
        </label>
        <input type="hidden" name="extraction_status" value={status} />
        <input type="hidden" name="extraction_warning" value={warning} />
      </section>

      <button className="h-11 rounded border border-cyan-200/35 bg-cyan-200/12 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-50 transition hover:bg-cyan-200/18">
        Criar rascunho
      </button>
    </form>
  );
}

async function runOcr(pdf: { getPage(pageNumber: number): Promise<unknown> }, pageCount: number) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("por+eng");
  const parts: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = (await pdf.getPage(pageNumber)) as {
        getViewport(options: { scale: number }): { width: number; height: number };
        render(options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): {
          promise: Promise<void>;
        };
      };
      const viewport = page.getViewport({ scale: 1.35 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) continue;

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const result = await worker.recognize(canvas.toDataURL("image/png"));
      if (result.data.text.trim()) {
        parts.push(result.data.text.trim());
      }
    }
  } finally {
    await worker.terminate();
  }

  return parts.join("\n\n").trim();
}

function suggestTags(text: string) {
  const reserved = new Set(["para", "com", "uma", "como", "mais", "entre", "sobre", "quando", "onde", "documento"]);
  const counts = new Map<string, number>();

  for (const rawWord of text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{5,}/g) ?? []) {
    if (!reserved.has(rawWord)) {
      counts.set(rawWord, (counts.get(rawWord) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([word]) => word)
    .join(", ");
}

function Input({
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/45"
      />
    </label>
  );
}
