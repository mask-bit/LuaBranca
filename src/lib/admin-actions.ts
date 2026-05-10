"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  extractContentBlockText,
  parseContentBlocks,
  type ContentBlock,
} from "@/lib/content-blocks";
import {
  confidenceOptions,
  getRouteForKind,
  labelize,
  riskOptions,
  secrecyOptions,
  statusOptions,
  type RecordKind,
} from "@/lib/modules";
import { metadataFields } from "@/lib/record-fields";
import { commonRecordSchema, validateMetadata } from "@/lib/record-schema";
import { getAdminContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from "@/lib/supabase/env";
import { slugify, parseCommaList } from "@/lib/utils";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionValue<T extends readonly string[]>(formData: FormData, key: string, options: T, fallback: T[number]) {
  const value = stringValue(formData, key);
  return options.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function metadataFromForm(kind: RecordKind, formData: FormData) {
  const raw: Record<string, string> = {};

  for (const field of metadataFields[kind]) {
    raw[field.name] = stringValue(formData, `metadata.${field.name}`);
  }

  return validateMetadata(kind, raw);
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function getAuthorizedAdminClient(minAccessLevel: number, failurePath: string) {
  const context = await getAdminContext(minAccessLevel, failurePath);

  if (!context.configured) {
    redirectWithError("/admin", context.reason);
  }

  if (context.forbidden) {
    redirectWithError(failurePath, "Acesso insuficiente para esta acao.");
  }

  const client =
    context.authMethod === "pin" ? createSupabaseAdminClient() : await createSupabaseServerClient();

  if (!client) {
    redirectWithError("/admin", "Credencial privada ausente ou banco indisponivel.");
  }

  return { context, client, actorId: context.user?.id ?? null };
}

async function uploadAssets(recordId: string, kind: RecordKind, formData: FormData, client: SupabaseClient) {
  const files = formData
    .getAll("assets")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) return null;

  let firstAssetId: string | null = null;

  for (const file of files) {
    const asset = await uploadAssetFile(recordId, kind, file, client, {
      visibility: formData.get("asset_visibility") === "private" ? "private" : "public",
      assetType: formData.get("asset_type") === "attachment" ? "attachment" : "image",
    });

    firstAssetId ??= asset.id;
  }

  return firstAssetId;
}

async function uploadAssetFile(
  recordId: string,
  kind: RecordKind,
  file: File,
  client: SupabaseClient,
  options: { visibility: "public" | "private"; assetType: "image" | "attachment" | "diagram" | "note" },
) {
  const bucket = options.visibility === "private" ? PRIVATE_BUCKET : PUBLIC_BUCKET;
  const safeName = `${Date.now()}-${crypto.randomUUID()}-${slugify(file.name) || "arquivo"}`;
  const path = `${kind}/${recordId}/${safeName}`;

  const upload = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (upload.error) {
    throw new Error(upload.error.message);
  }

  const publicUrl =
    options.visibility === "private"
      ? null
      : client.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const { data, error } = await client
    .from("assets")
    .insert({
      record_id: recordId,
      bucket,
      path,
      public_url: publicUrl,
      filename: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      visibility: options.visibility,
      asset_type: options.assetType,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as { id: string };
}

async function syncContentBlocks(
  recordId: string,
  kind: RecordKind,
  formData: FormData,
  client: SupabaseClient,
  blocks: ContentBlock[],
) {
  const visibility = formData.get("asset_visibility") === "private" ? "private" : "public";
  let firstAssetId: string | null = null;

  const nextBlocks = await Promise.all(
    blocks.map(async (block) => {
      if (!("assetIds" in block)) return block;

      const files = formData
        .getAll(`block_asset_${block.id}`)
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);

      if (files.length === 0) return block;

      const uploadedIds: string[] = [];
      for (const file of files) {
        const asset = await uploadAssetFile(recordId, kind, file, client, {
          visibility,
          assetType: block.type === "attachment" ? "attachment" : "image",
        });
        uploadedIds.push(asset.id);
        firstAssetId ??= asset.id;
      }

      if (block.type === "gallery") {
        return { ...block, assetIds: [...block.assetIds, ...uploadedIds] };
      }

      return { ...block, assetIds: uploadedIds };
    }),
  );

  const { error } = await client.from("records").update({ content_blocks: nextBlocks }).eq("id", recordId);
  if (error) throw new Error(error.message);
  return { blocks: nextBlocks, firstAssetId };
}

async function syncTags(recordId: string, formData: FormData, client: SupabaseClient) {
  const selectedSlugs = formData
    .getAll("tag_slugs")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const typedTags = parseCommaList(formData.get("new_tags"));
  const legacyTags = parseCommaList(formData.get("tags"));

  await client.from("record_tags").delete().eq("record_id", recordId);

  const tagIds = new Set<string>();

  if (selectedSlugs.length > 0) {
    const { data, error } = await client.from("tags").select("id").in("slug", selectedSlugs);
    if (error) throw new Error(error.message);
    for (const tag of data ?? []) tagIds.add(tag.id);
  }

  for (const name of [...typedTags, ...legacyTags]) {
    const slug = slugify(name);
    if (!slug) continue;

    const { data: tag, error } = await client
      .from("tags")
      .upsert({ name, slug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    tagIds.add(tag.id);
  }

  if (tagIds.size === 0) return;

  const { error } = await client.from("record_tags").insert(
    Array.from(tagIds).map((tagId) => ({
      record_id: recordId,
      tag_id: tagId,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function syncRelations(recordId: string, formData: FormData, client: SupabaseClient) {
  const relatedIds = formData
    .getAll("related_ids")
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .filter((id) => id !== recordId);

  await client.from("record_relations").delete().eq("source_record_id", recordId);
  if (relatedIds.length === 0) return;

  await client.from("record_relations").insert(
    relatedIds.map((relatedRecordId) => ({
      source_record_id: recordId,
      related_record_id: relatedRecordId,
      relation_type: stringValue(formData, "relation_type") || "relacionado",
    })),
  );
}

async function writeAudit(recordId: string, action: string, changes: Record<string, unknown>, client: SupabaseClient, userId: string | null) {
  await client.from("audit_events").insert({
    record_id: recordId,
    user_id: userId,
    action,
    changes,
  });
}

export async function saveRecordAction(kind: RecordKind, id: string | null, formData: FormData) {
  const route = getRouteForKind(kind);
  const failurePath = id ? `/admin/${route}/${id}/editar` : `/admin/${route}/novo`;
  const { context, client, actorId } = await getAuthorizedAdminClient(2, failurePath);

  const title = stringValue(formData, "title");
  const slug = stringValue(formData, "slug") || slugify(title);

  const parsed = commonRecordSchema.safeParse({
    kind,
    title,
    slug,
    summary: stringValue(formData, "summary"),
    description: stringValue(formData, "description"),
    category: stringValue(formData, "category"),
    risk: optionValue(formData, "risk", riskOptions, "baixo"),
    secrecy: optionValue(formData, "secrecy", secrecyOptions, "restrito"),
    confidence: optionValue(formData, "confidence", confidenceOptions, "media"),
    status: optionValue(formData, "status", statusOptions, "rascunho"),
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
  });

  if (!parsed.success) {
    redirectWithError(failurePath, parsed.error.issues[0]?.message ?? "Registro invalido.");
  }

  let metadata: Record<string, unknown>;
  try {
    metadata = metadataFromForm(kind, formData);
  } catch {
    redirectWithError(failurePath, "Metadados invalidos para o modulo selecionado.");
  }

  let contentBlocks: ContentBlock[] = [];
  try {
    contentBlocks = parseContentBlocks(formData.get("content_blocks"));
  } catch {
    redirectWithError(failurePath, "Blocos de conteudo invalidos.");
  }

  const blockText = extractContentBlockText(contentBlocks);

  const payload = {
    ...parsed.data,
    slug,
    description: blockText || parsed.data.description,
    metadata,
    content_blocks: contentBlocks,
    updated_by: actorId,
    published_at: parsed.data.is_published ? new Date().toISOString() : null,
  };

  const result = id
    ? await client.from("records").update(payload).eq("id", id).select("id").single()
    : await client
        .from("records")
        .insert({ ...payload, created_by: actorId })
        .select("id")
        .single();

  if (result.error || !result.data) {
    redirectWithError(failurePath, result.error?.message ?? "Falha ao salvar registro.");
  }

  const recordId = result.data.id as string;

  try {
    const contentResult = await syncContentBlocks(recordId, kind, formData, client, contentBlocks);
    const uploadedCoverId = await uploadAssets(recordId, kind, formData, client);
    const coverCandidateId = uploadedCoverId ?? contentResult.firstAssetId;

    if (coverCandidateId && formData.get("use_first_upload_as_cover") === "on") {
      await client.from("records").update({ cover_asset_id: coverCandidateId }).eq("id", recordId);
    }

    await syncTags(recordId, formData, client);
    await syncRelations(recordId, formData, client);
    await writeAudit(
      recordId,
      id ? "update" : "create",
      {
        title: parsed.data.title,
        kind,
        status: labelize(parsed.data.status),
        published: parsed.data.is_published,
        actor: context.authMethod === "pin" ? "pin-admin" : "supabase-user",
      },
      client,
      actorId,
    );
  } catch (error) {
    redirectWithError(failurePath, error instanceof Error ? error.message : "Falha ao sincronizar anexos ou relacoes.");
  }

  revalidatePath("/");
  revalidatePath(`/${route}`);
  revalidatePath(`/admin/${route}`);
  revalidatePath("/buscar");
  revalidatePath("/admin/tags");
  redirect(`/admin/${route}?saved=1`);
}

export async function deleteRecordAction(kind: RecordKind, id: string) {
  const route = getRouteForKind(kind);
  const { client, actorId } = await getAuthorizedAdminClient(4, `/admin/${route}/${id}/editar`);

  await writeAudit(id, "delete", { kind, actor: actorId ? "supabase-user" : "pin-admin" }, client, actorId);
  const { error } = await client.from("records").delete().eq("id", id);

  if (error) {
    redirectWithError(`/admin/${route}/${id}/editar`, error.message);
  }

  revalidatePath("/");
  revalidatePath(`/${route}`);
  revalidatePath(`/admin/${route}`);
  revalidatePath("/buscar");
  revalidatePath("/admin/tags");
  redirect(`/admin/${route}?deleted=1`);
}

export async function createTagAction(formData: FormData) {
  const { client } = await getAuthorizedAdminClient(2, "/admin/tags");

  const name = stringValue(formData, "name");
  const slug = stringValue(formData, "slug") || slugify(name);
  if (!name || !slug) redirectWithError("/admin/tags", "Informe um nome de tag valido.");

  const { error } = await client.from("tags").upsert({ name, slug }, { onConflict: "slug" });
  if (error) redirectWithError("/admin/tags", error.message);

  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/admin/tags");
  redirect("/admin/tags?created=1");
}

export async function updateTagAction(id: string, formData: FormData) {
  const { client } = await getAuthorizedAdminClient(2, "/admin/tags");

  const name = stringValue(formData, "name");
  const slug = stringValue(formData, "slug") || slugify(name);
  if (!name || !slug) redirectWithError("/admin/tags", "Informe um nome de tag valido.");

  const { error } = await client.from("tags").update({ name, slug }).eq("id", id);
  if (error) redirectWithError("/admin/tags", error.message);

  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/admin/tags");
  redirect("/admin/tags?updated=1");
}

export async function deleteTagAction(id: string) {
  const { client } = await getAuthorizedAdminClient(2, "/admin/tags");

  const { error } = await client.from("tags").delete().eq("id", id);
  if (error) redirectWithError("/admin/tags", error.message);

  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/admin/tags");
  redirect("/admin/tags?deleted=1");
}
