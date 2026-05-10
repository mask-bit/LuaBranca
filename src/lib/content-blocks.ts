import { z } from "zod";

const blockId = z.string().trim().min(1);
const textValue = z.string().trim().optional().default("");
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const assetIds = z.array(z.string().trim().min(1)).default([]);

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id: blockId,
    type: z.literal("heading"),
    text: textValue,
  }),
  z.object({
    id: blockId,
    type: z.literal("paragraph"),
    text: textValue,
  }),
  z.object({
    id: blockId,
    type: z.literal("quote"),
    text: textValue,
    source: optionalText,
  }),
  z.object({
    id: blockId,
    type: z.literal("technical_fact"),
    label: textValue,
    value: textValue,
  }),
  z.object({
    id: blockId,
    type: z.literal("image"),
    assetIds,
    caption: optionalText,
  }),
  z.object({
    id: blockId,
    type: z.literal("gallery"),
    assetIds,
    caption: optionalText,
  }),
  z.object({
    id: blockId,
    type: z.literal("attachment"),
    assetIds,
    caption: optionalText,
  }),
]);

export const contentBlocksSchema = z.array(contentBlockSchema).default([]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentBlockType = ContentBlock["type"];

export function parseContentBlocks(value: unknown): ContentBlock[] {
  if (!value) return [];
  if (typeof value === "string") {
    if (!value.trim()) return [];
    return contentBlocksSchema.parse(JSON.parse(value));
  }

  return contentBlocksSchema.parse(value);
}

export function extractContentBlockText(blocks: ContentBlock[]) {
  return blocks
    .flatMap((block) => {
      if (block.type === "heading" || block.type === "paragraph") return [block.text];
      if (block.type === "quote") return [block.text, block.source ?? ""];
      if (block.type === "technical_fact") return [block.label, block.value];
      return [block.caption ?? ""];
    })
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function hasReadableContentBlocks(blocks: ContentBlock[]) {
  return extractContentBlockText(blocks).length > 0 || blocks.some((block) => "assetIds" in block && block.assetIds.length > 0);
}

export function createEmptyContentBlock(type: ContentBlockType, id: string): ContentBlock {
  if (type === "heading") return { id, type, text: "" };
  if (type === "paragraph") return { id, type, text: "" };
  if (type === "quote") return { id, type, text: "" };
  if (type === "technical_fact") return { id, type, label: "", value: "" };
  return { id, type, assetIds: [] };
}
