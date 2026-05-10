import type { RecordFilters } from "@/lib/data";
import {
  confidenceOptions,
  getKindFromRoute,
  riskOptions,
  secrecyOptions,
  statusOptions,
  type ConfidenceLevel,
  type RecordKind,
  type RecordStatus,
  type RiskLevel,
  type SecrecyLevel,
} from "@/lib/modules";

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function option<T extends readonly string[]>(value: unknown, options: T) {
  return typeof value === "string" && options.includes(value as T[number])
    ? (value as T[number])
    : undefined;
}

export function parseRecordFilters(
  params: Params,
  options: { kind?: RecordKind; publicOnly: boolean; admin?: boolean; limit?: number } = {
    publicOnly: true,
  },
): RecordFilters {
  const publication = first(params.publication);
  const featured = first(params.featured);
  const media = first(params.media);
  const order = first(params.order);
  const view = first(params.view);
  const moduleRoute = first(params.module);

  return {
    kind: options.kind ?? (moduleRoute ? (getKindFromRoute(moduleRoute) ?? undefined) : undefined),
    publicOnly: options.publicOnly,
    limit: options.limit,
    query: first(params.q),
    tag: first(params.tag),
    category: first(params.category),
    risk: option(first(params.risk), riskOptions) as RiskLevel | undefined,
    secrecy: option(first(params.secrecy), secrecyOptions) as SecrecyLevel | undefined,
    confidence: option(first(params.confidence), confidenceOptions) as ConfidenceLevel | undefined,
    status: option(first(params.status), statusOptions) as RecordStatus | undefined,
    published: options.admin
      ? publication === "published"
        ? true
        : publication === "draft"
          ? false
          : undefined
      : undefined,
    featured: options.admin ? (featured === "featured" ? true : undefined) : undefined,
    hasMedia: media === "with_media" ? true : media === "without_media" ? false : undefined,
    view: view === "grid" ? "grid" : view === "list" ? "list" : undefined,
    order:
      order === "created_desc" || order === "title_asc" || order === "updated_desc"
        ? order
        : "updated_desc",
  };
}

export function activeFilterEntries(params: Params, labels: Record<string, string> = {}) {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      const current = first(value);
      if (!current) return [];
      return [{ key, value: current, label: labels[key] ?? key }];
    })
    .filter((entry) => !["page"].includes(entry.key));
}
