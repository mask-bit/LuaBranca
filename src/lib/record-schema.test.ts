import { describe, expect, it } from "vitest";
import { recordKinds } from "@/lib/modules";
import { commonRecordSchema, metadataSchemas, validateMetadata } from "@/lib/record-schema";

describe("record schemas", () => {
  it("validates common record fields with defaults", () => {
    const parsed = commonRecordSchema.parse({
      kind: "technique",
      title: "Fluxo Circular",
      is_published: false,
      is_featured: false,
    });

    expect(parsed.risk).toBe("baixo");
    expect(parsed.secrecy).toBe("restrito");
    expect(parsed.confidence).toBe("media");
    expect(parsed.status).toBe("rascunho");
  });

  it("has metadata schema for every module", () => {
    for (const kind of recordKinds) {
      expect(metadataSchemas[kind]).toBeDefined();
      expect(() => validateMetadata(kind, {})).not.toThrow();
    }
  });

  it("normalizes empty optional metadata fields", () => {
    const parsed = validateMetadata("symbol", {
      color: "#9ee7ff",
      faction: "",
      known_function: "Ativacao",
    });

    expect(parsed.color).toBe("#9ee7ff");
    expect(parsed.faction).toBeNull();
    expect(parsed.known_function).toBe("Ativacao");
  });
});
