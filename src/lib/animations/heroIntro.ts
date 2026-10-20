import { gsap } from "gsap";

/*
 * Entrada do Hero ao carregar a página (~1,5s, uma única timeline).
 *
 * Fluxo:
 * 1. Um script no <head> põe a classe INTRO_CLASS no <html> antes da
 *    primeira pintura; o CSS (globals.css, bloco "Entrada do Hero") esconde
 *    os alvos com os mesmos valores de `from` abaixo, até o JS assumir.
 * 2. Na hidratação, a timeline é criada com fromTo: o GSAP aplica os
 *    valores iniciais (inline) na hora.
 * 3. Quando as imagens da cena estão prontas (ou após maxWait), a timeline
 *    toca; no primeiro quadro a classe sai — o GSAP já segura o estado.
 *
 * Os alvos (data-intro) são sempre elementos internos, nunca os que o
 * parallax de scroll move: os dois não disputam o mesmo transform.
 *
 * at = início na timeline (s); duration (s); stagger entre itens (s);
 * from = estado inicial (manter igual ao CSS de globals.css).
 * maxWait: espera máxima (s) pelas imagens da cena antes de começar, para a
 * paisagem e os textos se revelarem juntos (o scroll nunca é bloqueado).
 */
export const INTRO = {
  ease: "power3.out",
  maxWait: 0.4,
  backdrop: { at: 0, duration: 1.2, from: { opacity: 0.92 } },
  navbar: { at: 0, duration: 0.7, from: { y: -28, opacity: 0 } },
  title: { at: 0.15, duration: 0.8, stagger: 0.07, from: { yPercent: 110, opacity: 0 } },
  scene: { at: 0.25, duration: 0.9, from: { y: 50, opacity: 0.78 } },
  tagline: { at: 0.55, duration: 0.7, from: { x: 24, opacity: 0 } },
  social: { at: 0.6, duration: 0.6, stagger: 0.07, from: { x: -18, opacity: 0 } },
  seal: { at: 0.85, duration: 0.6, from: { scale: 0.9, opacity: 0 } },
} as const;

export const INTRO_CLASS = "hero-intro";

/**
 * Script do <head>: liga o estado inicial só se a entrada vai rodar — sem
 * movimento reduzido, sem âncora na URL e sem scroll restaurado no meio da
 * página (reload/voltar guardam a posição em sessionStorage). Se o JS da
 * página não assumir em 4s, a classe sai e o Hero aparece pronto.
 */
export const INTRO_HEAD_SCRIPT = `(function(){var d=document.documentElement,k="heroScrollY";try{var n=performance.getEntriesByType("navigation")[0],restored=n&&n.type!=="navigate"&&+sessionStorage.getItem(k)>0;if(!location.hash&&!restored&&matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("${INTRO_CLASS}");setTimeout(function(){d.classList.remove("${INTRO_CLASS}")},4000)}}catch(e){}addEventListener("pagehide",function(){try{sessionStorage.setItem(k,String(scrollY))}catch(e){}})})();`;

type Step = { at: number; duration: number; stagger?: number; from: gsap.TweenVars };

const STEPS = ["backdrop", "navbar", "title", "scene", "tagline", "social", "seal"] as const;

// Estado final. Alvos com transform recebem todos os componentes no início e
// no fim, para o GSAP não somar um transform lido do CSS aos valores dados.
const SHOWN = { x: 0, y: 0, yPercent: 0, scale: 1 };

/**
 * Toca a entrada se a página abriu no topo com a classe ativa; caso
 * contrário mostra o estado final direto. Deve rodar dentro de um
 * gsap.context (useGSAP): ao desmontar, a timeline é desfeita. Retorna a
 * função que cancela o início ainda pendente (espera das imagens).
 */
export function playHeroIntro(hero: HTMLElement) {
  const root = document.documentElement;
  const finish = () => root.classList.remove(INTRO_CLASS);
  let cancelled = false;

  if (!root.classList.contains(INTRO_CLASS)) return () => {};
  if (window.scrollY > 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return () => {};
  }

  // Busca no documento todo: a navbar fica fora do escopo do Hero.
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-intro]"));
  const of = (name: string) => targets.filter((el) => el.dataset.intro === name);

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: INTRO.ease },
    // O GSAP já aplicou os valores iniciais (fromTo): a classe pode sair.
    onStart: finish,
    onComplete() {
      gsap.set(targets, { clearProps: "transform,opacity" });
    },
  });

  for (const name of STEPS) {
    const { at, duration, stagger, from }: Step = INTRO[name];
    const moves = Object.keys(from).some((key) => key !== "opacity");
    tl.fromTo(
      of(name),
      moves ? { ...SHOWN, ...from } : from,
      { ...(moves ? SHOWN : {}), opacity: 1, duration, stagger, immediateRender: true },
      at,
    );
  }

  const images = Array.from(
    hero.querySelectorAll<HTMLImageElement>('[data-intro="backdrop"] img, [data-intro="scene"] img'),
  );
  Promise.race([
    Promise.all(images.map((img) => img.decode().catch(() => undefined))),
    new Promise((resolve) => setTimeout(resolve, INTRO.maxWait * 1000)),
  ]).then(() => {
    if (!cancelled) tl.play();
  });

  // Strict Mode (dev) monta, desmonta e monta de novo: o context desfaz a
  // primeira timeline e isto impede que ela toque depois.
  return () => {
    cancelled = true;
  };
}
