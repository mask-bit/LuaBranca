import type { SupabaseClient } from "@supabase/supabase-js";
import { hasAdminPinSession } from "@/lib/admin-pin";
import { parseContentBlocks, type ContentBlock } from "@/lib/content-blocks";
import {
  confidenceOptions,
  recordKinds,
  riskOptions,
  secrecyOptions,
  statusOptions,
  type ConfidenceLevel,
  type RecordKind,
  type RecordStatus,
  type RiskLevel,
  type SecrecyLevel,
} from "@/lib/modules";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify, toWebSearchQuery } from "@/lib/utils";

export type Asset = {
  id: string;
  record_id: string;
  bucket: string;
  path: string;
  public_url: string | null;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  visibility: "public" | "private";
  asset_type: "cover" | "image" | "attachment" | "diagram" | "note";
  sort_order: number;
  created_at: string;
};

export type RelatedRecord = {
  relation_type: string;
  record: Pick<RecordItem, "id" | "kind" | "title" | "slug" | "summary" | "risk" | "secrecy">;
};

export type TagItem = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  record_count: number;
};

export type RecordItem = {
  id: string;
  kind: RecordKind;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  risk: RiskLevel;
  secrecy: SecrecyLevel;
  confidence: ConfidenceLevel;
  status: RecordStatus;
  is_published: boolean;
  is_featured: boolean;
  metadata: Record<string, unknown>;
  content_blocks: ContentBlock[];
  cover_asset_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  tags: string[];
  assets: Asset[];
  relations: RelatedRecord[];
};

export type RecordFilters = {
  kind?: RecordKind;
  query?: string;
  tag?: string;
  category?: string;
  risk?: RiskLevel;
  secrecy?: SecrecyLevel;
  confidence?: ConfidenceLevel;
  status?: RecordStatus;
  published?: boolean;
  featured?: boolean;
  hasMedia?: boolean;
  view?: "list" | "grid";
  order?: "updated_desc" | "created_desc" | "title_asc";
  publicOnly?: boolean;
  limit?: number;
};

export type DashboardStats = {
  total: number;
  byKind: Record<RecordKind, number>;
  recentTests: number;
  highRisk: number;
  incompleteTheses: number;
  unclassified: number;
};

function emptyStats(): DashboardStats {
  return {
    total: 0,
    recentTests: 0,
    highRisk: 0,
    incompleteTheses: 0,
    unclassified: 0,
    byKind: Object.fromEntries(recordKinds.map((kind) => [kind, 0])) as Record<
      RecordKind,
      number
    >,
  };
}

function ensureOption<T extends readonly string[]>(value: unknown, options: T, fallback: T[number]) {
  return options.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function normalizeRecord(row: Record<string, unknown>): RecordItem {
  let contentBlocks: ContentBlock[] = [];
  try {
    contentBlocks = parseContentBlocks(row.content_blocks);
  } catch {
    contentBlocks = [];
  }

  return {
    id: String(row.id),
    kind: ensureOption(row.kind, recordKinds, "library"),
    title: String(row.title ?? "Sem titulo"),
    slug: String(row.slug ?? row.id),
    summary: typeof row.summary === "string" ? row.summary : null,
    description: typeof row.description === "string" ? row.description : null,
    category: typeof row.category === "string" ? row.category : null,
    risk: ensureOption(row.risk, riskOptions, "baixo"),
    secrecy: ensureOption(row.secrecy, secrecyOptions, "restrito"),
    confidence: ensureOption(row.confidence, confidenceOptions, "media"),
    status: ensureOption(row.status, statusOptions, "rascunho"),
    is_published: Boolean(row.is_published),
    is_featured: Boolean(row.is_featured),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    content_blocks: contentBlocks,
    cover_asset_id: typeof row.cover_asset_id === "string" ? row.cover_asset_id : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    tags: [],
    assets: [],
    relations: [],
  };
}

async function hydrateRecords(client: SupabaseClient, records: RecordItem[]) {
  if (records.length === 0) return records;

  const ids = records.map((record) => record.id);
  const recordMap = new Map(records.map((record) => [record.id, record]));

  const [assetsResult, tagsResult, relationsResult] = await Promise.all([
    client
      .from("assets")
      .select("*")
      .in("record_id", ids)
      .order("sort_order", { ascending: true }),
    client.from("record_tags").select("record_id,tags(name,slug)").in("record_id", ids),
    client.from("record_relations").select("*").in("source_record_id", ids),
  ]);

  if (assetsResult.data) {
    for (const asset of assetsResult.data as Asset[]) {
      recordMap.get(asset.record_id)?.assets.push(asset);
    }
  }

  if (tagsResult.data) {
    for (const tagRow of tagsResult.data as unknown as Array<{
      record_id: string;
      tags: { name: string } | Array<{ name: string }> | null;
    }>) {
      const tags = Array.isArray(tagRow.tags) ? tagRow.tags : tagRow.tags ? [tagRow.tags] : [];
      for (const tag of tags) {
        if (tag.name) {
          recordMap.get(tagRow.record_id)?.tags.push(tag.name);
        }
      }
    }
  }

  const relationRows =
    (relationsResult.data as Array<{
      source_record_id: string;
      related_record_id: string;
      relation_type: string;
    }> | null) ?? [];

  const relatedIds = Array.from(new Set(relationRows.map((row) => row.related_record_id)));
  const relatedById = new Map<string, RecordItem>();

  if (relatedIds.length > 0) {
    const { data } = await client.from("records").select("*").in("id", relatedIds);
    for (const row of data ?? []) {
      const related = normalizeRecord(row as Record<string, unknown>);
      relatedById.set(related.id, related);
    }
  }

  for (const row of relationRows) {
    const related = relatedById.get(row.related_record_id);
    if (related) {
      recordMap.get(row.source_record_id)?.relations.push({
        relation_type: row.relation_type,
        record: {
          id: related.id,
          kind: related.kind,
          title: related.title,
          slug: related.slug,
          summary: related.summary,
          risk: related.risk,
          secrecy: related.secrecy,
        },
      });
    }
  }

  return records;
}

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured;
}

async function createDataClient(admin = false) {
  if (admin && (await hasAdminPinSession())) {
    return createSupabaseAdminClient();
  }

  return createSupabaseServerClient();
}

export async function fetchRecords(filters: RecordFilters = {}) {
  const publicOnly = filters.publicOnly ?? true;
  const client = await createDataClient(!publicOnly);
  if (!client) return [];

  let query = client.from("records").select("*");

  if (filters.tag) {
    const slug = slugify(filters.tag);
    if (!slug) return [];

    const { data: taggedRows, error } = await client
      .from("record_tags")
      .select("record_id,tags!inner(slug)")
      .eq("tags.slug", slug);

    if (error) {
      console.error("Lua Branca tag filter error:", error.message);
      return [];
    }

    const ids = Array.from(new Set((taggedRows ?? []).map((row) => row.record_id as string)));
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.risk) query = query.eq("risk", filters.risk);
  if (filters.secrecy) query = query.eq("secrecy", filters.secrecy);
  if (filters.confidence) query = query.eq("confidence", filters.confidence);
  if (filters.status) query = query.eq("status", filters.status);
  if (typeof filters.published === "boolean") query = query.eq("is_published", filters.published);
  if (typeof filters.featured === "boolean") query = query.eq("is_featured", filters.featured);

  if (publicOnly) {
    query = query.eq("is_published", true).lte("published_at", new Date().toISOString());
  }

  const search = filters.query?.trim();
  if (search) {
    const webQuery = toWebSearchQuery(search);
    query = webQuery
      ? query.textSearch("search_vector", webQuery, { config: "portuguese", type: "websearch" })
      : query.ilike("title", `%${search}%`);
  }

  if (filters.order === "title_asc") {
    query = query.order("title", { ascending: true });
  } else if (filters.order === "created_desc") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) {
    console.error("Lua Branca fetchRecords error:", error.message);
    return [];
  }

  const hydrated = await hydrateRecords(
    client,
    (data ?? []).map((row) => normalizeRecord(row as Record<string, unknown>)),
  );

  if (typeof filters.hasMedia === "boolean") {
    return hydrated.filter((record) => {
      const hasMedia =
        record.assets.length > 0 ||
        record.content_blocks.some((block) => "assetIds" in block && block.assetIds.length > 0);
      return filters.hasMedia ? hasMedia : !hasMedia;
    });
  }

  return hydrated;
}

export async function fetchTags(publicOnly = true): Promise<TagItem[]> {
  const client = await createDataClient(!publicOnly);
  if (!client) return [];

  const { data: tags, error } = await client.from("tags").select("*").order("name", { ascending: true });
  if (error) {
    console.error("Lua Branca fetchTags error:", error.message);
    return [];
  }

  if (!tags || tags.length === 0) return [];

  const { data: tagRows } = await client
    .from("record_tags")
    .select("tag_id,record_id,records!inner(is_published,published_at)")
    .in(
      "tag_id",
      tags.map((tag) => tag.id),
    );

  const counts = new Map<string, number>();
  const now = Date.now();

  for (const row of (tagRows ?? []) as unknown as Array<{
    tag_id: string;
    records: { is_published: boolean; published_at: string | null } | Array<{ is_published: boolean; published_at: string | null }>;
  }>) {
    const records = Array.isArray(row.records) ? row.records : row.records ? [row.records] : [];
    const visible = publicOnly
      ? records.some(
          (record) =>
            record.is_published &&
            Boolean(record.published_at) &&
            new Date(record.published_at as string).getTime() <= now,
        )
      : true;

    if (visible) {
      counts.set(row.tag_id, (counts.get(row.tag_id) ?? 0) + 1);
    }
  }

  return (tags as Array<{ id: string; name: string; slug: string; created_at: string }>).map((tag) => ({
    ...tag,
    record_count: counts.get(tag.id) ?? 0,
  }));
}

export async function fetchRecordBySlug(kind: RecordKind, slug: string, publicOnly = true) {
  const records = await fetchRecords({ kind, publicOnly, limit: 200 });
  return records.find((record) => record.slug === slug) ?? null;
}

export async function fetchRecordById(id: string) {
  const client = await createDataClient(true);
  if (!client) return null;

  const { data, error } = await client.from("records").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;

  const [record] = await hydrateRecords(client, [normalizeRecord(data as Record<string, unknown>)]);
  return record;
}

export async function fetchDashboardStats(publicOnly = true): Promise<DashboardStats> {
  const records = await fetchRecords({ publicOnly, limit: 1000 });
  const stats = emptyStats();

  stats.total = records.length;

  for (const record of records) {
    stats.byKind[record.kind] += 1;
    if (record.risk === "alto" || record.risk === "critico") stats.highRisk += 1;
    if (record.kind === "thesis" && ["incompleto", "em_estudo"].includes(record.status)) {
      stats.incompleteTheses += 1;
    }
    if (!record.category && record.tags.length === 0) stats.unclassified += 1;
    if (record.kind === "test") {
      const ageMs = Date.now() - new Date(record.created_at).getTime();
      if (ageMs < 1000 * 60 * 60 * 24 * 14) stats.recentTests += 1;
    }
  }

  return stats;
}

export async function fetchAuditEvents(limit = 20) {
  const client = await createDataClient(true);
  if (!client) return [];

  const { data, error } = await client
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
