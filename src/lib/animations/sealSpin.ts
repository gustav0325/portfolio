import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Rotação contínua do selo "ROLE A PAGINA" (ScrollIndicator.tsx). */
export const SCROLL_INDICATOR_MOTION = {
  rotation: 360,
  /** Uma volta completa (s), sempre na mesma velocidade. */
  duration: 18,
  ease: "none",
  repeat: -1,
  /** Começa depois da entrada do selo (heroIntro.ts: 0,85s + 0,6s)… */
  startAt: 1.45,
  /** …acelerando de leve até a velocidade final, sem tranco. */
  rampIn: 1.2,
} as const;

/**
 * Gira só o wrapper do texto circular ([data-seal-spin]) — a entrada
 * controla o anel e o parallax o link, então nenhum transform é disputado.
 * Pausa quando o Hero sai da tela e continua de onde parou ao voltar. Com
 * movimento reduzido, nada roda (o selo fica estático).
 */
export function createSealSpin(track: HTMLElement, hero: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const spin = hero.querySelector<HTMLElement>("[data-seal-spin]");
    if (!spin) return;
    const { rotation, duration, ease, repeat, startAt, rampIn } = SCROLL_INDICATOR_MOTION;

    const loop = gsap.to(spin, { rotation, duration, ease, repeat });
    loop.timeScale(0);
    gsap.to(loop, { timeScale: 1, duration: rampIn, delay: startAt, ease: "power1.inOut" });

    const visible = ScrollTrigger.create({
      trigger: track,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
    });
    if (!visible.isActive) loop.pause();
  });
  return { revert: () => mm.revert() };
}
