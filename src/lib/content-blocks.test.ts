import { describe, expect, it } from "vitest";
import { extractContentBlockText, parseContentBlocks } from "@/lib/content-blocks";

describe("content blocks", () => {
  it("parses typed blocks", () => {
    const blocks = parseContentBlocks(
      JSON.stringify([
        { id: "a", type: "heading", text: "Lua Branca" },
        { id: "b", type: "technical_fact", label: "Risco", value: "baixo" },
        { id: "c", type: "image", assetIds: ["asset-1"], caption: "Capa" },
      ]),
    );

    expect(blocks).toHaveLength(3);
    expect(blocks[2]).toMatchObject({ type: "image", assetIds: ["asset-1"] });
  });

  it("extracts searchable text", () => {
    const text = extractContentBlockText([
      { id: "a", type: "heading", text: "Titulo" },
      { id: "b", type: "paragraph", text: "Texto principal" },
      { id: "c", type: "quote", text: "Citacao", source: "Arquivo" },
    ]);

    expect(text).toContain("Titulo");
    expect(text).toContain("Texto principal");
    expect(text).toContain("Arquivo");
  });
});
