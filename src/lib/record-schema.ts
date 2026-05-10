import { z } from "zod";
import {
  confidenceOptions,
  recordKinds,
  riskOptions,
  secrecyOptions,
  statusOptions,
  type RecordKind,
} from "@/lib/modules";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const text = z.string().trim().min(1, "Campo obrigatorio");

export const commonRecordSchema = z.object({
  kind: z.enum(recordKinds),
  title: text,
  slug: optionalText,
  summary: optionalText,
  description: optionalText,
  category: optionalText,
  risk: z.enum(riskOptions).default("baixo"),
  secrecy: z.enum(secrecyOptions).default("restrito"),
  confidence: z.enum(confidenceOptions).default("media"),
  status: z.enum(statusOptions).default("rascunho"),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

export const metadataSchemas = {
  library: z.object({
    material_type: optionalText,
    author_origin: optionalText,
    material_date: optionalText,
    main_text: optionalText,
    example_notes: optionalText,
  }),
  thesis: z.object({
    author: optionalText,
    main_theme: optionalText,
    central_hypothesis: optionalText,
    development: optionalText,
    evidence: optionalText,
    contradictions: optionalText,
  }),
  knowledge: z.object({
    origin: optionalText,
    type: optionalText,
    application: optionalText,
    symbols_linked: optionalText,
    factions_linked: optionalText,
    notes: optionalText,
  }),
  technique: z.object({
    technique_type: optionalText,
    origin: optionalText,
    faction: optionalText,
    activation_mode: optionalText,
    required_gesture: optionalText,
    associated_symbol: optionalText,
    energy_type: optionalText,
    effect: optionalText,
    risks: optionalText,
    restrictions: optionalText,
    mastery_level: optionalText,
    cases: optionalText,
  }),
  symbol: z.object({
    color: optionalText,
    faction: optionalText,
    visual_description: optionalText,
    known_function: optionalText,
    perceived_effects: optionalText,
    activation_type: optionalText,
    compatibility: optionalText,
    notes: optionalText,
  }),
  faction: z.object({
    function: optionalText,
    energy_type: optionalText,
    common_techniques: optionalText,
    political_position: optionalText,
    current_state: optionalText,
    known_members: optionalText,
    threat_level: optionalText,
    notes: optionalText,
  }),
  test: z.object({
    test_date: optionalText,
    location: optionalText,
    technique_used: optionalText,
    symbol_used: optionalText,
    duration: optionalText,
    observed_effect: optionalText,
    body_response: optionalText,
    result: optionalText,
    conclusion: optionalText,
    next_step: optionalText,
  }),
} satisfies Record<RecordKind, z.ZodObject<Record<string, z.ZodTypeAny>>>;

export function validateMetadata(kind: RecordKind, value: unknown) {
  return metadataSchemas[kind].parse(value);
}

export type RecordMetadata<K extends RecordKind = RecordKind> = z.infer<
  (typeof metadataSchemas)[K]
>;

export type CommonRecordInput = z.infer<typeof commonRecordSchema>;
