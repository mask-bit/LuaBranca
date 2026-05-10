import { describe, expect, it } from "vitest";
import { parseCommaList, slugify, toWebSearchQuery } from "@/lib/utils";

describe("utils", () => {
  it("creates stable ascii slugs", () => {
    expect(slugify("T\u00e9cnica de Conten\u00e7\u00e3o: Lua Branca")).toBe("tecnica-de-contencao-lua-branca");
  });

  it("parses comma lists", () => {
    const form = new FormData();
    form.set("tags", "simbolo, risco alto,  teste ");

    expect(parseCommaList(form.get("tags"))).toEqual(["simbolo", "risco alto", "teste"]);
  });

  it("turns search text into a websearch-friendly query", () => {
    expect(toWebSearchQuery("simbolo azul raro")).toBe("simbolo & azul & raro");
  });
});
