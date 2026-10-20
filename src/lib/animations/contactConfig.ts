/*
 * Animação da seção Contato — todos os valores ajustáveis ficam aqui (arquivo
 * sem GSAP: também é lido pelos componentes do servidor).
 *
 * A: entrada do conteúdo — uma timeline, uma vez por visita.
 * B: brilho — entra junto com o conteúdo e depois fica em loop (respiração,
 *    deriva, anéis e alternância rosa/pêssego), pausado fora da tela.
 * Movimento reduzido: nada roda; o brilho fica estático, sem anéis.
 */
export const CONTACT_MOTION = {
  intro: {
    /** Dispara quando o índice "03 — CONTATO" chega nesta altura da tela. */
    start: "top 85%",
    ease: "power3.out",
    stagger: 0.09,
    /** Posição (s) e duração (s) de cada parte; total ≈ 1,35s. */
    index: { at: 0, duration: 0.45, y: 6, lineDuration: 0.4 },
    line1: { at: 0.1, duration: 0.7 },
    line2: { at: 0.2, duration: 0.75 },
    lead: { at: 0.35, duration: 0.55, y: 16 },
    rules: { at: 0.45, duration: 0.6 },
    cta: { at: 0.5, duration: 0.6, arrowAt: 0.75, arrowDuration: 0.45, arrow: { x: -6, y: 6 } },
    email: { at: 0.62, duration: 0.5, y: 10, copyDuration: 0.6 },
    footer: { at: 0.75, duration: 0.5, socialDuration: 0.45, socialScale: 0.85 },
    /** Entrada do brilho, junto com a headline; os loops começam depois dela. */
    glow: { at: 0.1, duration: 0.9, scale: 0.9 },
  },

  /** Respiração do brilho rosa (escala e opacidade, ida e volta). */
  glow: {
    duration: 7,
    scaleMin: 1,
    scaleMax: 1.06,
    opacityMin: 0.85,
    opacityMax: 1,
    /** Deriva lenta (px do Figma) e período de cada eixo (s), diferentes para não ficar mecânico. */
    drift: { x: 6, y: 5, durationX: 9, durationY: 11.5 },
  },

  /** Anéis finos que nascem no centro do arco, expandem e se dissipam. */
  waves: {
    desktopCount: 3,
    mobileCount: 2,
    /** Diâmetro inicial (px do Figma); o arco do Figma tem 480. */
    baseSize: 330,
    duration: 8,
    stagger: 2.7,
    maxScale: 1.5,
    mobileMaxScale: 1.3,
    maxOpacity: 0.35,
    /** Fração do ciclo em que o anel chega à opacidade máxima (evita surgir de repente). */
    fadeIn: 0.12,
  },

  /** Alternância rosa ↔ pêssego: só a opacidade da camada pêssego varia. */
  colorShift: {
    duration: 12,
    /** Pico da camada pêssego: acima de ~0,4 o laranja passa a dominar o rosa. */
    maxOpacity: 0.35,
    mobileMaxOpacity: 0.22,
  },

  /** Telas < 1024px: deslocamentos e intensidade menores. */
  mobile: { driftScale: 0.5, breathScaleMax: 1.04 },
} as const;
