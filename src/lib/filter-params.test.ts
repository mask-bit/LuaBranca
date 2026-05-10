import { describe, expect, it } from "vitest";
import { parseRecordFilters } from "@/lib/filter-params";

describe("parseRecordFilters", () => {
  it("parses public filters and ignores admin-only publication", () => {
    const filters = parseRecordFilters(
      {
        q: "lua",
        tag: "energia-azul",
        module: "tecnicas",
        risk: "alto",
        media: "with_media",
        view: "grid",
        publication: "draft",
      },
      { publicOnly: true },
    );

    expect(filters.query).toBe("lua");
    expect(filters.tag).toBe("energia-azul");
    expect(filters.kind).toBe("technique");
    expect(filters.risk).toBe("alto");
    expect(filters.hasMedia).toBe(true);
    expect(filters.view).toBe("grid");
    expect(filters.published).toBeUndefined();
  });

  it("parses admin publication and featured filters", () => {
    const filters = parseRecordFilters(
      {
        publication: "published",
        featured: "featured",
        order: "title_asc",
      },
      { publicOnly: false, admin: true },
    );

    expect(filters.published).toBe(true);
    expect(filters.featured).toBe(true);
    expect(filters.order).toBe("title_asc");
  });
});
