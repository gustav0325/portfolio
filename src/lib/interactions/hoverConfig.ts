/*
 * Microinterações do site (hover e clique) — todos os valores
 * ajustáveis ficam aqui. Arquivo sem GSAP: também é lido por componentes do
 * servidor. Os poucos efeitos feitos só em CSS (logo, chevron, áreas de
 * atuação, foco dos irmãos sociais) usam os tokens --hover-* de globals.css,
 * com os mesmos valores.
 *
 * Assinatura: magnetismo discreto + movimento curto + gradiente laranja → rosa
 * tirado do céu do Hero (public/hero/ceu.png, faixa do horizonte).
 */

/** Cores do pôr do sol. Também em globals.css (--sunset-*); manter iguais. */
export const SUNSET = {
  /** Horizonte do céu do Hero. */
  orange: "#fc9357",
  /** Rosa do céu do Hero, acima do horizonte. */
  pink: "#db5f71",
  /** Rosa suave já usado no site (ponto do Sobre, "Copiar e-mail", arco do Contato). */
  rose: "#d6959e",
} as const;

export const HOVER_MOTION = {
  duration: 0.4,
  ease: "power3.out",

  /** Atração em direção ao ponteiro (px de tela, no máximo) e retorno. */
  magnetic: {
    socialMax: 6,
    linkMax: 5,
    duration: 0.45,
  },

  /** Disco que preenche o botão a partir do ponto de entrada do cursor. */
  fill: {
    duration: 0.45,
    leaveDuration: 0.35,
  },

  social: {
    /** Troca vertical do ícone (sobe e sai, a cópia entra por baixo). */
    iconDuration: 0.4,
    /** Opacidade dos ícones irmãos (CSS: --hover-sibling-opacity). */
    siblingOpacity: 0.65,
  },

  /** Letras sobem dentro da máscara; a cópia entra por baixo. */
  textRoll: {
    /** Duração de cada letra (s). */
    duration: 0.35,
    /** Atraso entre letras (s)… */
    stagger: 0.015,
    /** …limitado a este total, para textos longos terminarem em ~0,5s. */
    maxStagger: 0.15,
  },

  /** Sublinhado: retrai para a direita e redesenha da esquerda. */
  underline: {
    retract: 0.18,
    draw: 0.3,
  },

  /** Seta ↗: sai para cima/direita, a cópia entra de baixo/esquerda. */
  arrow: {
    offset: 5,
    /** Começa depois do texto — é o último detalhe da interação. */
    delay: 0.08,
    duration: 0.35,
  },

  /** CTA "Entre em contato": deslocamento horizontal e linha inferior. */
  contactLine: {
    shift: 7,
    duration: 0.45,
    fillDuration: 0.5,
  },

  /** Reação do brilho do Contato ao CTA (sem mexer no ritmo dos loops). */
  contactGlow: {
    scale: 1.03,
    /** Opacidade da camada extra laranja/rosa sobre o brilho. */
    boost: 0.32,
    /** Cor dos anéis durante o hover (base: SUNSET.rose). */
    ringColor: "#c97685",
    duration: 0.8,
  },

  /** Clique: 1 → 0,97 → 1. */
  press: {
    scale: 0.97,
    down: 0.09,
    up: 0.3,
  },

  /** Confirmação do "Copiado ✓". */
  copyPulse: {
    scale: 1.06,
    duration: 0.16,
  },

  project: {
    zoom: 1.02,
    duration: 0.45,
    /** Pico de opacidade do reflexo radial. */
    spotlightOpacity: 0.12,
    /** Atraso com que o reflexo segue o cursor (s). */
    spotlightFollow: 0.35,
  },

  /** Pílula de hover da navbar (desliza entre os links). */
  navPill: {
    duration: 0.4,
    fade: 0.2,
    /** Folga em torno do texto do link (em). */
    padX: 0.75,
    padY: 0.4,
  },
} as const;

/**
 * Títulos dos projetos com link (AnimatedProjectLink): text roll, seta ↗ e
 * sublinhado rosa, iguais nos três.
 */
export const PROJECT_LINK_HOVER = {
  /** Duração de cada letra (s). */
  duration: 0.42,
  ease: "power3.out",
  /** Atraso entre letras (s), limitado a um total para títulos longos. */
  letterStagger: 0.015,
  maxStagger: 0.12,
  /** Seta: deslocamento diagonal (px), duração e atraso em relação ao texto. */
  arrowDistance: 5,
  arrowDuration: 0.4,
  arrowDelay: 0.08,
  /** Sublinhado: cresce da esquerda; ao sair, recolhe para a direita. */
  underlineDuration: 0.4,
} as const;
