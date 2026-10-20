/*
 * Animação da seção Sobre — todos os valores ajustáveis ficam aqui (arquivo
 * sem GSAP: também é lido pelos componentes do servidor).
 *
 * A seção NÃO fica presa: rola normalmente. Dois sistemas:
 * - A (scrub): headline, frase de destaque e parágrafo acendem conforme o
 *   scroll (opacidade de cada letra / linha / palavra). Reversível.
 * - B (timelines curtas, uma vez por visita): índice, números, divisores,
 *   ferramentas, "Vamos conversar" e áreas de atuação entram ao aparecer.
 *
 * start/end seguem a sintaxe do ScrollTrigger ("<borda do elemento> <altura
 * da tela>"). Os intervalos foram escolhidos para cada texto terminar de
 * acender enquanto ainda está numa posição confortável de leitura.
 */
export const ABOUT_MOTION = {
  /** Opacidade dos textos ainda "apagados". */
  inactiveOpacity: 0.15,

  headline: {
    start: "top 85%",
    end: "top 40%",
    scrub: 0.8,
    /**
     * Ponto final de "do código." em rosa (a cor dos números). false = cor
     * original do Figma (a do degradê naquela posição).
     */
    accentPeriod: true,
    accentColor: "#d6959e",
  },

  /** Frase de destaque: linha por linha; "experiências digitais" termina um pouco depois. */
  featuredText: {
    start: "top 70%",
    end: "top 35%",
    scrub: 0.8,
  },

  /** Parágrafo: palavra por palavra. */
  paragraph: {
    start: "top 78%",
    end: "bottom 55%",
    scrub: 0.8,
  },

  /** Telas < 1024px: intervalos mais curtos (o texto chega mais rápido ao topo). */
  mobile: {
    headline: { start: "top 90%", end: "top 55%" },
    featuredText: { start: "top 88%", end: "top 55%" },
    paragraph: { start: "top 88%", end: "bottom 70%" },
  },

  /** Timelines curtas: disparam quando o bloco chega nesta altura da tela. */
  revealStart: "top 88%",
  ease: "power3.out",

  index: { duration: 0.6, x: -12 },

  stats: {
    duration: 1.2,
    stagger: 0.12,
    /** Valores menores que este não "contam" (ficaria artificial): só entram com fade. */
    minCount: 5,
    y: 12,
    /** Divisores verticais (scaleY de cima para baixo). */
    dividerDuration: 0.6,
  },

  tools: { duration: 0.6, stagger: 0.08, y: 16 },

  cta: { duration: 0.6, y: 12, lineDuration: 0.6, arrowDuration: 0.4 },

  services: {
    lineDuration: 0.9,
    labelDuration: 0.5,
    duration: 0.65,
    stagger: 0.12,
    y: 18,
  },
} as const;

/**
 * Fotografia da seção Sobre (AboutVisual + aboutMotion.ts):
 * - reveal: cortina de baixo para cima (clip-path), uma vez, sem scrub —
 *   começa quando ~30% da foto já entrou na tela e termina sozinha;
 * - parallax: a foto se move devagar dentro da moldura (scrub). `distance` é
 *   o percurso total em px; a imagem tem essa folga extra, então nunca
 *   aparecem bordas vazias.
 */
export const ABOUT_PHOTO_MOTION = {
  reveal: {
    start: "30% bottom",
    duration: 1.1,
    ease: "power3.out",
  },
  parallax: {
    distance: 28,
    /** Telas < 1024px. */
    mobileDistance: 16,
    scrub: 0.9,
  },
} as const;
