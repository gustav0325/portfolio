import { gsap } from "gsap";
import { PROJECT_CONTENT, SECTION_INTRO } from "./projectsConfig";

/*
 * Timelines curtas (independentes do scrub) da seção Projetos: a entrada e a
 * saída do conteúdo de cada projeto e a entrada do cabeçalho. Todas são
 * criadas pausadas, já aplicando o estado inicial; quem decide quando tocar
 * é projectsMotion.ts.
 */

/**
 * Entrada do conteúdo de um projeto: título pela máscara, descrição, tags e
 * seta por último. Deixa o conteúdo oculto até tocar.
 */
export function createContentIntro(slide: HTMLElement) {
  const q = gsap.utils.selector(slide);
  const content = q("[data-slide-content]");
  const { ease, title, description, tags, arrow } = PROJECT_CONTENT;

  gsap.set(content, { autoAlpha: 0 });

  return gsap
    .timeline({ paused: true, defaults: { ease } })
    .set(content, { autoAlpha: 1, y: 0 }, 0)
    .fromTo(
      q('[data-content="title"]'),
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: title.duration, immediateRender: true },
      title.at,
    )
    .fromTo(
      q('[data-content="description"]'),
      { y: description.y, opacity: 0 },
      { y: 0, opacity: 1, duration: description.duration, immediateRender: true },
      description.at,
    )
    .fromTo(
      q('[data-content="tag"]'),
      { y: tags.y, opacity: 0 },
      { y: 0, opacity: 1, duration: tags.duration, stagger: tags.stagger, immediateRender: true },
      tags.at,
    )
    .fromTo(
      q('[data-content="arrow"]'),
      { x: arrow.x, opacity: 0 },
      { x: 0, opacity: 1, duration: arrow.duration, immediateRender: true },
      arrow.at,
    );
}

/** Saída rápida do conteúdo (sobe e some) quando ele sai pelo topo. */
export function createContentExit(slide: HTMLElement) {
  const { duration, y, ease } = PROJECT_CONTENT.exit;
  return gsap.to(slide.querySelector("[data-slide-content]"), {
    autoAlpha: 0,
    y,
    duration,
    ease,
    paused: true,
  });
}

/** Entrada do cabeçalho: índice, título por linha (máscara) e texto auxiliar. */
export function createHeaderIntro(section: HTMLElement) {
  const q = gsap.utils.selector(section);
  const { ease, index, heading, lead } = SECTION_INTRO;

  return gsap
    .timeline({ paused: true, defaults: { ease } })
    .fromTo(
      q('[data-reveal="index"]'),
      { x: index.x, opacity: 0 },
      { x: 0, opacity: 1, duration: index.duration, immediateRender: true },
      index.at,
    )
    .fromTo(
      q('[data-reveal="heading"]'),
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: heading.duration,
        stagger: heading.stagger,
        immediateRender: true,
      },
      heading.at,
    )
    .fromTo(
      q('[data-reveal="lead"]'),
      { x: lead.x, opacity: 0 },
      { x: 0, opacity: 1, duration: lead.duration, immediateRender: true },
      lead.at,
    );
}
