import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { indicatorFill, indicatorTrack, px } from "@/components/projects/indicatorGeometry";
import { createContentExit, createContentIntro, createHeaderIntro } from "./projectContent";
import {
  PROJECT_CONTENT,
  PROJECT_PHASES,
  PROJECT_PIN,
  SECTION_INTRO,
} from "./projectsConfig";

gsap.registerPlugin(ScrollTrigger);

/*
 * Animação da seção Projetos (valores em projectsConfig.ts).
 *
 * ≥ 1024px: o palco (.pinStage, uma tela de altura) fica preso no
 *   enquadramento de referência — o mesmo em que o card 01 chega rolando,
 *   então o pin começa sem salto. Dentro dele, a coluna com os três projetos
 *   sobe (translateY, scrub) a distância medida no DOM, parando um trecho em
 *   cada projeto com as informações inteiras na tela. O indicador fica fixo.
 *   O conteúdo NÃO é scrub: a cada atualização vê-se quais áreas de
 *   informação estão na tela e toca a entrada/saída curta delas.
 * < 1024px: sem pin — cada card entra ao chegar na tela.
 * Movimento reduzido: nada roda; o CSS mostra tudo estático.
 */

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export function createProjectsMotion(section: HTMLElement) {
  const mm = gsap.matchMedia();
  // Depois de uma troca de idioma: refaz o pin só se a coluna mudou de altura.
  let relayout = () => {};

  mm.add(
    {
      desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { desktop, mobile } = context.conditions ?? {};
      if (!desktop && !mobile) return;

      ScrollTrigger.create({
        trigger: section.querySelector("header"),
        start: "top 85%",
        animation: createHeaderIntro(section),
        toggleActions: "play none none reverse",
      });

      if (mobile) {
        setupFlow(section);
        return;
      }

      // As distâncias dependem do tamanho da tela e da altura do conteúdo:
      // refaz o pin ao redimensionar e quando um texto novo muda a coluna.
      const column = section.querySelector<HTMLElement>("[data-projects-column]")!;
      let stack = createPinnedColumn(section);
      let columnHeight = column.scrollHeight;
      const rebuild = () => {
        stack.revert();
        context.add(() => {
          stack = createPinnedColumn(section);
        });
        columnHeight = column.scrollHeight;
      };
      let timer = 0;
      let size = `${innerWidth}x${innerHeight}`;
      const onResize = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (`${innerWidth}x${innerHeight}` === size) return;
          size = `${innerWidth}x${innerHeight}`;
          rebuild();
          ScrollTrigger.refresh();
        }, 250);
      };
      relayout = () => {
        if (column.scrollHeight !== columnHeight) rebuild();
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("resize", onResize);
        stack.revert();
      };
    },
  );

  return {
    /** Depois de trocar o idioma (com o texto novo já no DOM). */
    relayout: () => relayout(),
    revert: () => mm.revert(),
  };
}

/** ≥ 1024px: palco preso + coluna de projetos subindo (scrub) + conteúdo à parte. */
function createPinnedColumn(section: HTMLElement) {
  const ctx = gsap.context(() => buildPinnedColumn(section));
  return { revert: () => ctx.revert() };
}

function buildPinnedColumn(section: HTMLElement) {
  const spacer = section.querySelector<HTMLElement>("[data-projects-spacer]")!;
  const stage = section.querySelector<HTMLElement>("[data-projects-stage]")!;
  const projectsWindow = stage.querySelector<HTMLElement>("[data-projects-window]")!;
  const column = stage.querySelector<HTMLElement>("[data-projects-column]")!;
  const slides = Array.from(column.querySelectorAll<HTMLElement>("[data-slide]"));
  const media = slides.map((slide) => slide.querySelector<HTMLElement>("[data-slide-media]")!);
  const infos = slides.map((slide) => slide.querySelector<HTMLElement>("[data-slide-content]")!);
  const items = Array.from(stage.querySelectorAll<HTMLElement>("[data-indicator-item]"));
  const fills = Array.from(stage.querySelectorAll<HTMLElement>("[data-indicator-progress]"));
  const { scrollRatio, minRise, revealGap, readingSpace, readingDrift } = PROJECT_PHASES;

  // ---------- Geometria real (px), medida com a coluna na posição inicial ----------
  const windowH = projectsWindow.clientHeight;
  const travel = Math.max(0, column.scrollHeight - windowH);
  const columnTop = column.getBoundingClientRect().top;
  const offset = (el: HTMLElement) => el.getBoundingClientRect().top - columnTop;
  const pinTop = offset(slides[0]); // topo do projeto no enquadramento do pin
  const u = section.clientWidth / 1440;
  // Parada de leitura de cada projeto: as informações inteiras na tela, com
  // folga embaixo. A última é o fim da coluna.
  const stops: number[] = [];
  infos.forEach((info, k) => {
    const bottom = offset(info) + info.offsetHeight;
    let stop = k === infos.length - 1 ? travel : bottom + revealGap * u - windowH;
    if (k === 0) stop = Math.max(stop, minRise * windowH);
    stops.push(Math.min(travel, Math.max(stops[k - 1] ?? 0, stop)));
  });

  // ---------- Timeline (1 unidade = 1px de scroll) ----------
  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
  let t = 0;
  let y = 0;
  stops.forEach((stop, k) => {
    // Sobe até a parada de leitura deste projeto…
    if (stop > y) {
      tl.fromTo(column, { y: -y }, { y: -stop, duration: (stop - y) * scrollRatio, immediateRender: false }, t);
      t += (stop - y) * scrollRatio;
      y = stop;
    }
    // …e segura um trecho para leitura, ainda subindo bem devagar.
    const next = k + 1 < stops.length ? stops[k + 1] : y;
    const drift = Math.min(readingDrift * windowH, next - y);
    const reading = readingSpace * windowH;
    tl.fromTo(column, { y: -y }, { y: -(y + drift), duration: reading, immediateRender: false }, t);
    t += reading;
    y += drift;
  });
  const total = t;

  // O espaço do pin = palco + todo o trecho preso: o pin começa quando o topo
  // do palco chega ao topo da tela (o card já está no enquadramento) e solta
  // depois da leitura do projeto 03.
  gsap.set(spacer, { height: stage.offsetHeight + total });
  ScrollTrigger.create({
    trigger: spacer,
    start: "top top",
    end: `+=${total}`,
    scrub: PROJECT_PIN.scrub,
    animation: tl,
  });

  // ---------- Conteúdo e indicador: lidos da posição real dos projetos ----------

  const intros = slides.map(createContentIntro);
  const exits = slides.map(createContentExit);
  const shown = slides.map(() => false);
  let entered = false; // o card 01 já apareceu

  function setContent(k: number, visible: boolean, delay = 0) {
    if (shown[k] === visible) return;
    shown[k] = visible;
    if (visible) {
      exits[k].pause();
      intros[k].delay(delay).invalidate().restart(true);
    } else {
      intros[k].pause();
      exits[k].invalidate().restart();
    }
  }

  let activeItem = 0;
  function setIndicator(active: number, position: number) {
    fills.forEach((fill, i) => gsap.set(fill, { scaleY: indicatorFill(i, position) }));
    if (active === activeItem) return;
    activeItem = active;
    items.forEach((item, i) => {
      item.dataset.active = String(i === active);
      if (i === active) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
      item.querySelectorAll<HTMLElement>("[data-indicator-track]").forEach((el) => {
        const { top, height } = indicatorTrack(i, active);
        el.style.top = px(top);
        el.style.height = px(height);
      });
    });
  }

  function sync() {
    const stageTop = stage.getBoundingClientRect().top;
    const vh = innerHeight;
    // Entrada de cada projeto: 0 com o topo dele na base da tela, 1 no
    // enquadramento do pin.
    let active = 0;
    let position = 0;
    slides.forEach((slide, k) => {
      if (k === 0) return;
      const top = slide.getBoundingClientRect().top - stageTop;
      const e = clamp01((windowH - top) / (windowH - pinTop));
      position += e;
      if (e >= PROJECT_CONTENT.indicatorAt) active = k;
    });
    setIndicator(active, position);

    // Texto: entra quando a área de informação chega na tela e sai quando o
    // topo dela chega perto da navbar (saindo pelo topo, já depois da leitura).
    infos.forEach((info, k) => {
      const { top } = info.getBoundingClientRect();
      const visible =
        entered && top < PROJECT_CONTENT.enterLine * vh && top > PROJECT_CONTENT.exitLine * vh;
      setContent(k, visible, k === 0 && cardIntro.isActive() ? SECTION_INTRO.firstContentDelay : 0);
    });
  }

  // Entrada do card 01 quando ele chega na tela; libera o conteúdo.
  const { card } = SECTION_INTRO;
  const cardIntro = gsap
    .timeline({ paused: true })
    .fromTo(
      media[0],
      { y: card.y, opacity: 0 },
      { y: 0, opacity: 1, duration: card.duration, ease: SECTION_INTRO.ease, immediateRender: true },
    );
  ScrollTrigger.create({
    trigger: spacer,
    start: `top+=${pinTop} 85%`,
    onEnter: () => {
      entered = true;
      cardIntro.play();
      sync();
    },
    onLeaveBack: () => {
      entered = false;
      cardIntro.reverse();
      sync();
    },
  });

  // Reavalia a cada scroll enquanto a seção está na tela (antes, durante e
  // depois do pin) e a cada quadro do scrub.
  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onUpdate: sync,
  });
  tl.eventCallback("onUpdate", sync);
  sync();
}

/** < 1024px: projetos em sequência; cada um entra ao chegar na tela. */
function setupFlow(section: HTMLElement) {
  const { card } = SECTION_INTRO;
  section.querySelectorAll<HTMLElement>("[data-slide]").forEach((slide) => {
    const intro = createContentIntro(slide).paused(false);
    const tl = gsap
      .timeline({ paused: true })
      .fromTo(
        slide,
        { y: card.y, opacity: 0 },
        { y: 0, opacity: 1, duration: card.duration, ease: SECTION_INTRO.ease, immediateRender: true },
      )
      .add(intro, SECTION_INTRO.firstContentDelay);
    ScrollTrigger.create({
      trigger: slide,
      start: "top 85%",
      animation: tl,
      toggleActions: "play none none reverse",
    });
  });
}
