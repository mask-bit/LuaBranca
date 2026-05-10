"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthorizedAdminClient } from "@/lib/admin-actions";
import { getRouteForKind, recordKinds, type RecordKind } from "@/lib/modules";
import { PRIVATE_BUCKET } from "@/lib/supabase/env";
import { parseCommaList, slugify } from "@/lib/utils";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeKind(value: string): RecordKind {
  return recordKinds.includes(value as RecordKind) ? (value as RecordKind) : "library";
}

async function syncImportTags(recordId: string, rawTags: string, client: SupabaseClient) {
  const tags = parseCommaList(rawTags);
  if (tags.length === 0) return;

  const tagIds = new Set<string>();
  for (const name of tags) {
    const slug = slugify(name);
    if (!slug) continue;

    const { data, error } = await client
      .from("tags")
      .upsert({ name, slug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    tagIds.add(data.id);
  }

  if (tagIds.size > 0) {
    const { error } = await client.from("record_tags").insert(
      Array.from(tagIds).map((tagId) => ({
        record_id: recordId,
        tag_id: tagId,
      })),
    );

    if (error) throw new Error(error.message);
  }
}

async function uploadPdf(recordId: string, kind: RecordKind, file: File, client: SupabaseClient) {
  const safeName = `${Date.now()}-${crypto.randomUUID()}-${slugify(file.name) || "documento"}.pdf`;
  const path = `${kind}/${recordId}/${safeName}`;

  const upload = await client.storage.from(PRIVATE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/pdf",
  });

  if (upload.error) throw new Error(upload.error.message);

  const { data, error } = await client
    .from("assets")
    .insert({
      record_id: recordId,
      bucket: PRIVATE_BUCKET,
      path,
      public_url: null,
      filename: file.name,
      mime_type: file.type || "application/pdf",
      size_bytes: file.size,
      visibility: "private",
      asset_type: "attachment",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function importPdfDraftAction(formData: FormData) {
  const failurePath = "/admin/importar";
  const { client, actorId } = await getAuthorizedAdminClient(2, failurePath);

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${failurePath}?error=${encodeURIComponent("Selecione um PDF valido.")}`);
  }

  const kind = normalizeKind(stringValue(formData, "kind"));
  const title = stringValue(formData, "title") || file.name.replace(/\.pdf$/i, "");
  const extractedText = stringValue(formData, "extracted_text");
  const summary =
    stringValue(formData, "summary") ||
    (extractedText ? `${extractedText.slice(0, 320)}${extractedText.length > 320 ? "..." : ""}` : "PDF importado para revisao.");
  const baseSlug = slugify(title) || "pdf-importado";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const route = getRouteForKind(kind);
  const extractionStatus = stringValue(formData, "extraction_status") || "texto_extraido";
  const extractionWarning = stringValue(formData, "extraction_warning");

  const { data, error } = await client
    .from("records")
    .insert({
      kind,
      title,
      slug,
      summary,
      description: extractedText || "Texto nao extraido. Revise o PDF anexado.",
      content_blocks: extractedText
        ? [
            { id: crypto.randomUUID(), type: "heading", text: title },
            { id: crypto.randomUUID(), type: "paragraph", text: extractedText },
          ]
        : [],
      category: "importacao_pdf",
      risk: "baixo",
      secrecy: "restrito",
      confidence: extractedText.length > 80 ? "media" : "baixa",
      status: "rascunho",
      is_published: false,
      is_featured: false,
      metadata: {
        imported_from: "pdf",
        imported_filename: file.name,
        imported_text: extractedText || null,
        extraction_status: extractionStatus,
        extraction_warning: extractionWarning || null,
      },
      created_by: actorId,
      updated_by: actorId,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`${failurePath}?error=${encodeURIComponent(error?.message ?? "Falha ao criar rascunho.")}`);
  }

  const recordId = data.id as string;
  let uploadWarning: string | null = null;

  try {
    const assetId = await uploadPdf(recordId, kind, file, client);
    const { error: blockError } = await client
      .from("records")
      .update({
        content_blocks: [
          ...(extractedText
            ? [
                { id: crypto.randomUUID(), type: "heading", text: title },
                { id: crypto.randomUUID(), type: "paragraph", text: extractedText },
              ]
            : []),
          { id: crypto.randomUUID(), type: "attachment", assetIds: [assetId], caption: file.name },
        ],
      })
      .eq("id", recordId);
    if (blockError) throw new Error(blockError.message);
    await syncImportTags(recordId, stringValue(formData, "tags"), client);
  } catch (error) {
    uploadWarning = error instanceof Error ? error.message : "Falha ao anexar PDF ou tags.";
  }

  await client.from("audit_events").insert({
    record_id: recordId,
    user_id: actorId,
    action: "import_pdf_draft",
    changes: {
      actor: actorId ? "supabase-user" : "pin-admin",
      filename: file.name,
      extraction_status: extractionStatus,
      upload_warning: uploadWarning,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/${route}`);
  revalidatePath("/admin/tags");

  const warningQuery = uploadWarning ? `?error=${encodeURIComponent(`Rascunho criado, mas o PDF nao foi anexado: ${uploadWarning}`)}` : "?imported=1";
  redirect(`/admin/${route}/${recordId}/editar${warningQuery}`);
}
