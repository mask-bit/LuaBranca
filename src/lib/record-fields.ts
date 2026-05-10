import type { RecordKind } from "@/lib/modules";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "color" | "select";
  options?: readonly string[];
};

export const metadataFields: Record<RecordKind, FieldDef[]> = {
  library: [
    { name: "material_type", label: "Tipo de material", type: "select", options: ["documento", "relato", "imagem", "anotacao", "arquivo_historico", "transcricao", "diagrama"] },
    { name: "author_origin", label: "Autor ou origem" },
    { name: "material_date", label: "Data do material", type: "date" },
    { name: "main_text", label: "Texto principal", type: "textarea" },
    { name: "example_notes", label: "Imagem ou exemplo", type: "textarea" },
  ],
  thesis: [
    { name: "author", label: "Autor" },
    { name: "main_theme", label: "Tema principal" },
    { name: "central_hypothesis", label: "Hipotese central", type: "textarea" },
    { name: "development", label: "Desenvolvimento", type: "textarea" },
    { name: "evidence", label: "Evidencias", type: "textarea" },
    { name: "contradictions", label: "Contradicoes", type: "textarea" },
  ],
  knowledge: [
    { name: "origin", label: "Origem" },
    { name: "type", label: "Tipo", type: "select", options: ["energia", "fenda", "artefato", "faccao", "entidade", "fenomeno", "estrutura", "propriedade"] },
    { name: "application", label: "Aplicacao", type: "textarea" },
    { name: "symbols_linked", label: "Simbolos ligados" },
    { name: "factions_linked", label: "Faccoes ligadas" },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  technique: [
    { name: "technique_type", label: "Tipo", type: "select", options: ["fluxo", "contencao", "pressao", "alinhamento", "abertura", "suporte", "leitura", "ruptura", "interface"] },
    { name: "origin", label: "Origem" },
    { name: "faction", label: "Faccao" },
    { name: "activation_mode", label: "Modo de ativacao", type: "textarea" },
    { name: "required_gesture", label: "Gesto necessario" },
    { name: "associated_symbol", label: "Simbolo associado" },
    { name: "energy_type", label: "Tipo de energia" },
    { name: "effect", label: "Efeito", type: "textarea" },
    { name: "risks", label: "Riscos", type: "textarea" },
    { name: "restrictions", label: "Restricoes", type: "textarea" },
    { name: "mastery_level", label: "Nivel de dominio", type: "select", options: ["iniciante", "parcial", "intermediario", "avancado", "instavel", "proibido"] },
    { name: "cases", label: "Casos registrados", type: "textarea" },
  ],
  symbol: [
    { name: "color", label: "Cor", type: "color" },
    { name: "faction", label: "Faccao" },
    { name: "visual_description", label: "Descricao visual", type: "textarea" },
    { name: "known_function", label: "Funcao conhecida", type: "textarea" },
    { name: "perceived_effects", label: "Efeitos percebidos", type: "textarea" },
    { name: "activation_type", label: "Tipo de ativacao" },
    { name: "compatibility", label: "Compatibilidade", type: "textarea" },
    { name: "notes", label: "Observacoes", type: "textarea" },
  ],
  faction: [
    { name: "function", label: "Funcao", type: "textarea" },
    { name: "energy_type", label: "Tipo de energia" },
    { name: "common_techniques", label: "Tecnicas comuns" },
    { name: "political_position", label: "Posicao politica" },
    { name: "current_state", label: "Estado atual", type: "select", options: ["hostil", "neutra", "fragmentada", "extinta", "escondida", "infiltrada"] },
    { name: "known_members", label: "Membros conhecidos", type: "textarea" },
    { name: "threat_level", label: "Nivel de ameaca", type: "select", options: ["baixo", "medio", "alto", "critico"] },
    { name: "notes", label: "Notas", type: "textarea" },
  ],
  test: [
    { name: "test_date", label: "Data", type: "date" },
    { name: "location", label: "Local" },
    { name: "technique_used", label: "Tecnica usada" },
    { name: "symbol_used", label: "Simbolo usado" },
    { name: "duration", label: "Duracao" },
    { name: "observed_effect", label: "Efeito observado", type: "textarea" },
    { name: "body_response", label: "Resposta corporal", type: "textarea" },
    { name: "result", label: "Resultado", type: "select", options: ["falha", "parcial", "funcional", "instavel", "inconclusivo"] },
    { name: "conclusion", label: "Conclusao", type: "textarea" },
    { name: "next_step", label: "Proximo passo", type: "textarea" },
  ],
};
