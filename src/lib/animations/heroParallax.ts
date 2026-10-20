import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Parallax de scroll do Hero — todos os valores ajustáveis ficam aqui.
 *
 * O Hero é uma cena em profundidade: fica sticky dentro de um wrapper alto
 * e uma única timeline (scrub) move os planos e apaga os textos conforme o
 * progresso do scroll nesse trecho (0 = topo, 1 = fim do Hero).
 *
 * Planos (data-plane nas camadas, ver HeroLayers.tsx):
 *   sky           céu
 *   distantCloud  nuvens distantes (faixas finas do alto)
 *   mainScene     prédio + nuvens da base dele (nuvem-central), como uma
 *                 unidade: o mesmo deslocamento, então nunca se separam
 *   foreground    nuvens próximas da câmera, que entram por baixo da tela
 */

/** Trecho de scroll: altura do wrapper e suavização do scrub (segundos). */
export const HERO_SCROLL = {
  wrapperHeight: "200svh",
  wrapperHeightMobile: "150svh",
  scrub: 1,
} as const;

/**
 * Deslocamento vertical de cada plano no fim do Hero, em % da altura da tela
 * (positivo = desce/fica para trás; negativo = sobe/vem para a frente).
 * titleY em px. mobile multiplica todas as amplitudes abaixo de 768px.
 */
export const SPEEDS = {
  sky: 5,
  distantCloud: -4,
  mainScene: -8,
  foreground: -14,
  titleY: -50,
  mobile: 0.5,
} as const;

/** Janelas de fade (progresso 0–1): começa visível em *Start, some em *End. */
export const FADES = {
  titleStart: 0.2,
  titleEnd: 0.55,
  taglineStart: 0.15,
  taglineEnd: 0.4,
  sealStart: 0.1,
  sealEnd: 0.3,
  socialStart: 0.5,
  socialEnd: 0.7,
} as const;

const PLANES = ["sky", "distantCloud", "mainScene", "foreground"] as const;

export type HeroPlane = (typeof PLANES)[number];

/**
 * Cria o parallax de scroll. `track` é o wrapper alto do Hero (o trecho de
 * scroll); `hero` é a seção sticky dentro dele. Deve rodar dentro de um
 * gsap.context (useGSAP), que desfaz tudo ao desmontar.
 */
export function createHeroParallax(track: HTMLElement, hero: HTMLElement) {
  const q = gsap.utils.selector(hero);
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { desktop, mobile } = context.conditions ?? {};
      if (!desktop && !mobile) return; // prefers-reduced-motion: Hero estático

      const k = mobile ? SPEEDS.mobile : 1;
      // % da altura da tela → px, recalculado a cada refresh (resize).
      const vh = (percent: number) => () => (percent / 100) * hero.clientHeight * k;

      const tl = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: HERO_SCROLL.scrub,
          invalidateOnRefresh: true,
        },
      });

      for (const plane of PLANES) {
        tl.to(q(`[data-plane="${plane}"]`), { y: vh(SPEEDS[plane]) }, 0);
      }

      const fade = (selector: string, start: number, end: number) =>
        tl.to(q(selector), { autoAlpha: 0, duration: end - start }, start);

      tl.to(q('[data-parallax="title"]'), { y: SPEEDS.titleY * k, duration: FADES.titleEnd }, 0);
      fade('[data-parallax="title"]', FADES.titleStart, FADES.titleEnd);
      fade('[data-parallax="tagline"]', FADES.taglineStart, FADES.taglineEnd);
      fade('[data-parallax="seal"]', FADES.sealStart, FADES.sealEnd);
      fade('[data-parallax="social"]', FADES.socialStart, FADES.socialEnd);
    },
  );

  // As camadas têm tamanho fixo, mas fontes e imagens podem mudar métricas:
  // recalcula quando estiverem prontas.
  let active = true;
  const images = Array.from(hero.querySelectorAll("img"));
  Promise.all([
    document.fonts?.ready,
    ...images.map((img) => img.decode().catch(() => undefined)),
  ]).then(() => {
    if (active) ScrollTrigger.refresh();
  });

  return {
    revert() {
      active = false;
      mm.revert();
    },
  };
}
