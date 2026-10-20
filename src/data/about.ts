// Conteúdo da seção Sobre (frame 26:56 do Figma). Os textos traduzíveis
// (rótulos, áreas de atuação, parágrafo) ficam em src/i18n/messages → about.

export type Stat = {
  value: string;
  /** Rótulo em messages → about.stats[key]. */
  key: "projects" | "experience" | "focus";
};

/** Indicadores numéricos — valores ainda podem ser revisados antes da publicação. */
export const stats: Stat[] = [
  { value: "+20", key: "projects" },
  { value: "+1", key: "experience" },
  { value: "100%", key: "focus" },
];

/** Nomes de tecnologias: iguais em todos os idiomas. */
export const tools: string[] = ["FIGMA", "JAVASCRIPT", "REACT", "IA", "PYTHON"];

export type ServiceArea = {
  id: string;
  /** Nome em messages → about.areas[key]. */
  key: "design" | "development" | "interactive";
};

export const serviceAreas: ServiceArea[] = [
  { id: "01", key: "design" },
  { id: "02", key: "development" },
  { id: "03", key: "interactive" },
];
