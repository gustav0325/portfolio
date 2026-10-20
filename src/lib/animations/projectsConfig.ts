/*
 * Animação da seção Projetos — todos os valores ajustáveis ficam aqui
 * (arquivo sem GSAP: também é lido pelos componentes do servidor).
 *
 * Duas lógicas separadas:
 * - PIN + COLUNA (scrub): o palco prende no enquadramento de referência e a
 *   coluna com os três projetos sobe por dentro dele (translateY), parando
 *   um trecho em cada projeto para leitura. Ver PROJECT_PIN e PROJECT_PHASES.
 * - CONTEÚDO (timeline curta): título, descrição, tags e seta de cada projeto
 *   entram sozinhos quando a área de informação chega na tela e saem quando
 *   ela sai pelo topo. Nunca ficam presos no meio do fade. Ver PROJECT_CONTENT.
 *
 * Medidas em "px do Figma" escalam com a tela como o resto do layout.
 */

/** Ponto do pin: o enquadramento em que o palco fica preso. */
export const PROJECT_PIN = {
  /**
   * Base da navbar no Figma (topo 32 + altura 62), na mesma escala dela
   * (navbar.module.css).
   */
  navbarBottom: 94,
  /**
   * Topo da imagem do card no pin em relação à base da navbar (px do Figma;
   * negativo = por trás da navbar). Medido no print de referência (1352×615):
   * a imagem começa a 55px do topo, 33px acima da base da navbar → −35.
   */
  gap: -35,
  /**
   * Ajuste fino do indicador 01/02/03 (px do Figma, negativo = sobe). Em 0
   * ele mantém a relação do frame com o card — centrado na área do card.
   */
  indicatorShift: 0,
  /** Suavização do scrub (s). */
  scrub: 0.9,
} as const;

/**
 * Ritmo do scroll durante o pin. A coluna percorre a distância calculada pelo
 * DOM (altura da coluna − altura da janela) e para em cada projeto quando as
 * informações dele estão inteiras na tela. Frações da altura da tela, exceto
 * onde indicado.
 */
export const PROJECT_PHASES = {
  /** px de scroll por px que a coluna sobe (1 = acompanha o scroll). */
  scrollRatio: 1,
  /**
   * Subida mínima do projeto 01 antes da primeira leitura: em telas altas as
   * informações já cabem no pin, e sem isso a coluna começaria parada.
   */
  minRise: 0.12,
  /** Folga abaixo das informações na parada de leitura (px do Figma). */
  revealGap: 48,
  /** Trecho extra de scroll em cada parada de leitura. */
  readingSpace: 0.4,
  /** Quanto a coluna ainda sobe durante a leitura, para não parecer travada. */
  readingDrift: 0.04,
} as const;

/** Conteúdo de cada projeto (timeline independente do scrub). */
export const PROJECT_CONTENT = {
  /** Entra quando o topo da área de informação passa desta altura da tela. */
  enterLine: 0.88,
  /** Sai quando o topo da área de informação sobe acima desta altura (navbar). */
  exitLine: 0.15,
  /** O indicador troca quando o próximo projeto percorreu esta fração da entrada. */
  indicatorAt: 0.6,
  ease: "power3.out",
  title: { at: 0, duration: 0.6 },
  description: { at: 0.08, duration: 0.5, y: 12 },
  tags: { at: 0.18, duration: 0.45, stagger: 0.05, y: 8 },
  arrow: { at: 0.4, duration: 0.35, x: -5 },
  exit: { duration: 0.25, y: -16, ease: "power2.in" },
} as const;

/** Entrada da seção (cabeçalho e primeiro card), ao chegar na tela. */
export const SECTION_INTRO = {
  ease: "power3.out",
  index: { at: 0, duration: 0.6, x: -12 },
  heading: { at: 0.05, duration: 0.7, stagger: 0.08 },
  lead: { at: 0.2, duration: 0.6, x: 16 },
  card: { duration: 0.8, y: 35 },
  /** Atraso do conteúdo do card 01 depois que ele começa a entrar (s). */
  firstContentDelay: 0.25,
} as const;
