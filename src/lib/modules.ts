export const recordKinds = [
  "library",
  "thesis",
  "knowledge",
  "technique",
  "symbol",
  "faction",
  "test",
] as const;

export type RecordKind = (typeof recordKinds)[number];

export const routeToKind = {
  biblioteca: "library",
  teses: "thesis",
  conhecimentos: "knowledge",
  tecnicas: "technique",
  simbolos: "symbol",
  faccoes: "faction",
  testes: "test",
} as const satisfies Record<string, RecordKind>;

export type PublicRoute = keyof typeof routeToKind;

export const kindToRoute = Object.fromEntries(
  Object.entries(routeToKind).map(([route, kind]) => [kind, route]),
) as Record<RecordKind, PublicRoute>;

export const moduleConfigs: Record<
  RecordKind,
  {
    title: string;
    singular: string;
    route: PublicRoute;
    subtitle: string;
    phrase: string;
    coverHint: string;
  }
> = {
  library: {
    title: "Biblioteca",
    singular: "Material",
    route: "biblioteca",
    subtitle: "Arquivos, relatos, documentos e registros de apoio",
    phrase: "Documentos base, relatos e transcricoes de referencia.",
    coverHint: "Estante tecnica, paginas antigas e luz azul discreta",
  },
  thesis: {
    title: "Teses",
    singular: "Tese",
    route: "teses",
    subtitle: "Hipoteses analiticas, estruturas teoricas e interpretacoes em progresso",
    phrase: "Linhas de interpretacao, evidencias e contradicoes monitoradas.",
    coverHint: "Quadro com linhas, pontos conectados e anotacoes",
  },
  knowledge: {
    title: "Conhecimentos",
    singular: "Conhecimento",
    route: "conhecimentos",
    subtitle: "Registros objetivos, propriedades observadas e padroes catalogados",
    phrase: "Fenomenos, estruturas, energias e propriedades classificadas.",
    coverHint: "Circulo tecnico, simbolo central e mapa de conexoes",
  },
  technique: {
    title: "Tecnicas",
    singular: "Tecnica",
    route: "tecnicas",
    subtitle: "Metodos operacionais, aplicacoes energeticas e estruturas de execucao",
    phrase: "Modos de ativacao, efeitos, riscos e observacoes praticas.",
    coverHint: "Mao com simbolo, fluxo circular e diagrama de movimento",
  },
  symbol: {
    title: "Simbolos",
    singular: "Simbolo",
    route: "simbolos",
    subtitle: "Marcas, chaves de sintonia e estruturas de ativacao",
    phrase: "Chaves visuais, cores, compatibilidades e efeitos percebidos.",
    coverHint: "Simbolos flutuantes, brilho azul-claro e linhas finas",
  },
  faction: {
    title: "Faccoes",
    singular: "Faccao",
    route: "faccoes",
    subtitle: "Grupos, linhas de atuacao, conflitos e assinaturas proprias",
    phrase: "Grupos, relacoes, ameacas e assinaturas observadas.",
    coverHint: "Emblemas, mapa escuro, conexoes e divisoes",
  },
  test: {
    title: "Testes",
    singular: "Teste",
    route: "testes",
    subtitle: "Registros de pratica, resposta corporal e observacao de efeito",
    phrase: "Experiencias, efeitos corporais, resultados e proximos passos.",
    coverHint: "Mao ativando simbolo, grafico e brilho sutil",
  },
};

export const riskOptions = ["baixo", "medio", "alto", "critico"] as const;
export const secrecyOptions = ["publico_interno", "restrito", "sigiloso", "critico"] as const;
export const confidenceOptions = ["baixa", "media", "alta", "validada"] as const;
export const statusOptions = [
  "rascunho",
  "em_estudo",
  "incompleto",
  "validado_parcialmente",
  "contestado",
  "abandonado",
  "restrito",
  "publicado",
] as const;

export type RiskLevel = (typeof riskOptions)[number];
export type SecrecyLevel = (typeof secrecyOptions)[number];
export type ConfidenceLevel = (typeof confidenceOptions)[number];
export type RecordStatus = (typeof statusOptions)[number];

export function labelize(value: string) {
  return value.replaceAll("_", " ");
}

export function getKindFromRoute(route: string): RecordKind | null {
  return routeToKind[route as PublicRoute] ?? null;
}

export function getRouteForKind(kind: RecordKind) {
  return kindToRoute[kind];
}
