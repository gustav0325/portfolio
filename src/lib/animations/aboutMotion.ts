import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_MOTION, ABOUT_PHOTO_MOTION } from "./aboutConfig";

gsap.registerPlugin(ScrollTrigger);

/*
 * Animação da seção Sobre (valores em aboutConfig.ts). A seção rola
 * normalmente, sem pin.
 *
 * Sistema A (scrub, reversível): headline letra por letra, frase de destaque
 * linha por linha e parágrafo palavra por palavra acendem da opacidade
 * "apagada" até 1. Só a opacidade muda — cor, degradê e layout ficam os do
 * CSS, então o fim é idêntico ao estático.
 * Sistema B (timelines curtas, uma vez por visita): índice, números com
 * contagem, divisores, ferramentas, "Vamos conversar" e áreas de atuação.
 * Fotografia: cortina de baixo para cima (uma vez, clip-path) e parallax
 * interno discreto (scrub), em camadas separadas (AboutVisual.tsx).
 * Movimento reduzido: nada roda; tudo fica estático e legível.
 */

type Range = { start: string; end: string };

export function createAboutMotion(section: HTMLElement) {
  const mm = gsap.matchMedia();
  const q = gsap.utils.selector(section);
  const one = (selector: string) => q(selector)[0] as HTMLElement;
  // Refaz só o Sistema A (troca de idioma: letras e palavras são outras).
  let rebuildText = () => {};

  mm.add(
    {
      desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { desktop, mobile } = context.conditions ?? {};
      if (!desktop && !mobile) return;
      const M = ABOUT_MOTION;
      const ranges = mobile ? M.mobile : M;

      // ---------- Sistema A: textos acendendo com o scroll ----------
      // Num contexto próprio: na troca de idioma é desfeito e refeito para as
      // letras/palavras novas. Como é scrub, o estado volta a ser o da posição
      // do scroll — o que já foi lido continua aceso.

      const headline = one('[data-about="headline"]');
      const buildText = () => {
        let paintGradient = () => {};
        const ctx = gsap.context(() => {
          const scrubbed = (trigger: HTMLElement, range: Range, scrub: number) =>
            gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger, start: range.start, end: range.end, scrub },
            });
          const dim = { opacity: M.inactiveOpacity };
          const lit = { opacity: 1 };

          // Headline: letra por letra, na ordem de leitura (1ª linha, 2ª, ponto).
          const gradientLine = one("[data-reveal-gradient]");
          const gradientLetters = q("[data-reveal-gradient] [data-reveal-unit]") as HTMLElement[];
          // Cada letra do degradê recebe o pedaço dele que lhe cabe (ver CSS).
          paintGradient = () => {
            const line = gradientLine.getBoundingClientRect();
            const em = parseFloat(getComputedStyle(gradientLine).fontSize);
            gsap.set(gradientLine, { "--gw": `${line.width / em}em` });
            gradientLetters.forEach((letter) => {
              const x = (letter.getBoundingClientRect().left - line.left) / em;
              gsap.set(letter, { "--gx": `${x}em` });
            });
          };
          paintGradient();
          headline.setAttribute("data-letter-gradient", "");
          ScrollTrigger.addEventListener("refresh", paintGradient);
          scrubbed(headline, ranges.headline, M.headline.scrub).fromTo(
            q('[data-about="headline"] [data-reveal-unit]'),
            dim,
            { ...lit, duration: 1, stagger: 0.6 },
          );

          // Frase de destaque: linha por linha; "experiências digitais" começa com
          // a 2ª linha e termina um pouco depois dela.
          const statement = one('[data-about="statement"]');
          const lines = q('[data-about="statement"] [data-reveal-line]');
          scrubbed(statement, ranges.featuredText, M.featuredText.scrub)
            .fromTo(lines[0], dim, { ...lit, duration: 1 }, 0)
            .fromTo(q("[data-reveal-strong]"), dim, { ...lit, duration: 1.4 }, 0.8)
            .fromTo(lines[1], dim, { ...lit, duration: 1 }, 0.8)
            .fromTo(lines[2], dim, { ...lit, duration: 1 }, 1.6);

          // Parágrafo: palavra por palavra.
          const paragraph = one('[data-about="paragraph"]');
          scrubbed(paragraph, ranges.paragraph, M.paragraph.scrub).fromTo(
            q('[data-about="paragraph"] [data-reveal-unit]'),
            dim,
            { ...lit, duration: 1, stagger: 0.35 },
          );
        });
        return {
          revert() {
            ScrollTrigger.removeEventListener("refresh", paintGradient);
            headline.removeAttribute("data-letter-gradient");
            ctx.revert();
          },
        };
      };
      let text = buildText();
      rebuildText = () => {
        text.revert();
        context.add(() => {
          text = buildText();
        });
      };

      // ---------- Sistema B: entradas curtas, uma vez por visita ----------

      const onEnter = (trigger: HTMLElement, tl: gsap.core.Timeline) =>
        ScrollTrigger.create({
          trigger,
          start: M.revealStart,
          once: true,
          onEnter: () => tl.play(),
        });
      const reveal = () => gsap.timeline({ paused: true, defaults: { ease: M.ease } });

      // Índice 02.
      const index = one('[data-about="index"]');
      onEnter(
        index,
        reveal().fromTo(
          index,
          { opacity: 0, x: M.index.x },
          { opacity: 1, x: 0, duration: M.index.duration, immediateRender: true },
        ),
      );

      // Números: contagem até o valor (inteiros, com + e %), divisores de cima
      // para baixo. A largura do número fica travada na final durante a
      // contagem, para nada ao lado se mexer.
      const statsList = one('[data-about="stats"]');
      const statsTl = reveal();
      const values: HTMLElement[] = [];
      q("[data-stat]").forEach((item: HTMLElement, i: number) => {
        const at = i * M.stats.stagger;
        const valueEl = item.querySelector<HTMLElement>("[data-stat-value]")!;
        const raw = valueEl.dataset.statValue ?? valueEl.textContent ?? "";
        const [, prefix = "", digits = "", suffix = ""] = raw.match(/^(\D*)(\d+)(\D*)$/) ?? [];
        const target = Number(digits);
        values.push(valueEl);

        statsTl.fromTo(
          item,
          { opacity: 0, y: M.stats.y },
          { opacity: 1, y: 0, duration: 0.6, immediateRender: true },
          at,
        );
        if (digits && target >= M.stats.minCount) {
          const counter = { value: 0 };
          statsTl.fromTo(
            counter,
            { value: 0 },
            {
              value: target,
              duration: M.stats.duration,
              onStart: () => {
                valueEl.style.minWidth = `${valueEl.offsetWidth}px`;
              },
              onUpdate: () => {
                valueEl.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
              },
              onComplete: () => {
                valueEl.textContent = raw;
                valueEl.style.minWidth = "";
              },
            },
            at,
          );
        }
        if (i > 0) {
          statsTl.fromTo(
            item,
            { "--divider": 0 },
            { "--divider": 1, duration: M.stats.dividerDuration, immediateRender: true },
            at,
          );
        }
      });
      onEnter(statsList, statsTl);

      // Ferramentas: título e itens em sequência.
      const tools = one('[data-about="tools"]');
      onEnter(
        tools,
        reveal().fromTo(
          q('[data-about="tools"] [data-reveal-item]'),
          { opacity: 0, y: M.tools.y },
          {
            opacity: 1,
            y: 0,
            duration: M.tools.duration,
            stagger: M.tools.stagger,
            immediateRender: true,
          },
        ),
      );

      // "Vamos conversar": texto, sublinhado da esquerda para a direita, seta.
      const cta = one('[data-about="cta"]');
      const ctaLabel = one("[data-cta-label]");
      onEnter(
        cta,
        reveal()
          .fromTo(
            ctaLabel,
            { opacity: 0, y: M.cta.y, "--cta-line": 0 },
            { opacity: 1, y: 0, duration: M.cta.duration, immediateRender: true },
          )
          .to(ctaLabel, { "--cta-line": 1, duration: M.cta.lineDuration }, "-=0.25")
          .fromTo(
            one("[data-cta-arrow]"),
            { opacity: 0, x: -4 },
            { opacity: 1, x: 0, duration: M.cta.arrowDuration, immediateRender: true },
            "-=0.3",
          ),
      );

      // Áreas de atuação: linha da esquerda para a direita, título, itens.
      const rule = one('[data-about="services-rule"]');
      const { services } = M;
      onEnter(
        rule,
        reveal()
          .fromTo(
            rule,
            { scaleX: 0 },
            { scaleX: 1, duration: services.lineDuration, immediateRender: true },
          )
          .fromTo(
            one('[data-about="services-label"]'),
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: services.labelDuration, immediateRender: true },
            0.2,
          )
          .fromTo(
            q('[data-about="services"] [data-reveal-item]'),
            { opacity: 0, y: services.y },
            {
              opacity: 1,
              y: 0,
              duration: services.duration,
              stagger: services.stagger,
              immediateRender: true,
            },
            0.3,
          ),
      );

      // ---------- Fotografia ----------

      const photo = one('[data-about="photo"]');
      const { reveal: R, parallax: PX } = ABOUT_PHOTO_MOTION;

      // Cortina de baixo para cima: uma vez, sem scrub — depois de começar,
      // termina sozinha. Se a página já abriu com a foto passada do ponto de
      // início (link direto, scroll restaurado), ela fica revelada, sem piscar.
      const photoReveal = gsap.fromTo(
        one("[data-photo-reveal]"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: R.duration,
          ease: R.ease,
          paused: true,
          immediateRender: false,
        },
      );
      const revealTrigger = ScrollTrigger.create({
        trigger: photo,
        start: R.start,
        once: true,
        onEnter: () => photoReveal.play(),
      });
      if (revealTrigger.scroll() >= revealTrigger.start) photoReveal.progress(1);
      else photoReveal.progress(0);

      // Parallax interno: só a imagem se move, dentro da moldura parada.
      const room = mobile ? PX.mobileDistance : PX.distance;
      gsap.fromTo(
        one("[data-photo-parallax]"),
        { y: -room / 2 },
        {
          y: room / 2,
          ease: "none",
          scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: PX.scrub },
        },
      );

      // Ao desfazer (resize de breakpoint, desmontar): degradê e números voltam
      // ao original.
      return () => {
        text.revert();
        values.forEach((el) => {
          el.textContent = el.dataset.statValue ?? el.textContent;
          el.style.minWidth = "";
        });
      };
    },
  );

  // As quebras de linha dependem das fontes: recalcula quando estiverem prontas.
  let active = true;
  document.fonts?.ready.then(() => {
    if (active) ScrollTrigger.refresh();
  });

  return {
    /** Depois de trocar o idioma (com o texto novo já no DOM). */
    rebuildText: () => rebuildText(),
    revert() {
      active = false;
      mm.revert();
    },
  };
}
