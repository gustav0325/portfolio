import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT_MOTION } from "./contactConfig";

gsap.registerPlugin(ScrollTrigger);

/*
 * Animação da seção Contato (valores em contactConfig.ts).
 *
 * A — entrada: uma timeline (≈1,35s), disparada uma vez quando o conteúdo
 *     chega na tela; não reverte nem repete.
 * B — brilho: entra na mesma timeline e, ao terminar a entrada dele, começam
 *     os loops (respiração, deriva, anéis, alternância rosa/pêssego). Os loops
 *     ficam numa timeline própria, pausada enquanto a seção está fora da tela.
 * Cada camada do brilho tem um único dono de transform/opacidade
 * (ContactGlow.tsx), então entrada e loops nunca disputam o mesmo elemento.
 * Movimento reduzido: nada roda; tudo fica no estado final, brilho estático.
 */
export function createContactMotion(section: HTMLElement) {
  const mm = gsap.matchMedia();
  const q = gsap.utils.selector(section);
  const one = (selector: string) => q(selector)[0] as HTMLElement;

  mm.add(
    {
      desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { desktop, mobile } = context.conditions ?? {};
      if (!desktop && !mobile) return;
      const { intro: I, glow: G, waves: W, colorShift: C } = CONTACT_MOTION;
      const u = section.clientWidth / 1440; // px do Figma → px da tela (desktop)
      const unit = mobile ? 1 : u;

      // ---------- B: loops do brilho (pausados até a entrada terminar) ----------
      let visible = false; // seção na tela
      let glowReady = false; // a entrada do brilho terminou
      const loops = gsap.timeline({ paused: true });
      const drift = mobile ? CONTACT_MOTION.mobile.driftScale : 1;
      loops
        // Respiração: um pouco maior e mais clara, e volta.
        .fromTo(
          q("[data-glow-breath]"),
          { scale: G.scaleMin, opacity: G.opacityMin },
          {
            scale: mobile ? CONTACT_MOTION.mobile.breathScaleMax : G.scaleMax,
            opacity: G.opacityMax,
            duration: G.duration / 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
          0,
        )
        // Deriva quase imperceptível, com períodos diferentes em x e y.
        .fromTo(
          q("[data-glow-drift]"),
          { x: -G.drift.x * drift * unit },
          { x: G.drift.x * drift * unit, duration: G.drift.durationX, ease: "sine.inOut", yoyo: true, repeat: -1 },
          0,
        )
        .fromTo(
          q("[data-glow-drift]"),
          { y: G.drift.y * drift * unit },
          { y: -G.drift.y * drift * unit, duration: G.drift.durationY, ease: "sine.inOut", yoyo: true, repeat: -1 },
          0,
        )
        // Rosa ↔ pêssego: só a opacidade da camada pêssego (rosa predomina).
        .fromTo(
          q("[data-glow-peach]"),
          { opacity: 0 },
          {
            opacity: mobile ? C.mobileMaxOpacity : C.maxOpacity,
            duration: C.duration / 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
          0,
        );

      // Anéis: nascem no centro do arco, surgem de leve, expandem e se
      // dissipam até 0 antes de recomeçar (sem flash na repetição).
      const rings = q("[data-glow-ring]") as HTMLElement[];
      const count = mobile ? W.mobileCount : W.desktopCount;
      rings.forEach((ring, i) => {
        if (i >= count) return;
        const wave = gsap
          .timeline({ repeat: -1 })
          .fromTo(
            ring,
            { scale: 1 },
            { scale: mobile ? W.mobileMaxScale : W.maxScale, duration: W.duration, ease: "sine.out" },
            0,
          )
          .fromTo(
            ring,
            { opacity: 0 },
            { opacity: W.maxOpacity, duration: W.duration * W.fadeIn, ease: "sine.out" },
            0,
          )
          .to(
            ring,
            { opacity: 0, duration: W.duration * (1 - W.fadeIn), ease: "sine.inOut" },
            W.duration * W.fadeIn,
          );
        loops.add(wave, i * W.stagger);
      });

      // ---------- A: entrada do conteúdo (uma vez) ----------
      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: I.ease },
      });
      const set = { immediateRender: true };

      intro
        .fromTo(
          one('[data-contact="index"]'),
          { opacity: 0, y: I.index.y },
          { opacity: 1, y: 0, duration: I.index.duration, ...set },
          I.index.at,
        )
        .fromTo(
          one('[data-contact="index-line"]'),
          { scaleX: 0 },
          { scaleX: 1, duration: I.index.lineDuration, ...set },
          I.index.at + 0.05,
        )
        .fromTo(
          q('[data-contact="line"]')[0],
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: I.line1.duration, ...set },
          I.line1.at,
        )
        .fromTo(
          q('[data-contact="line"]')[1],
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: I.line2.duration, ...set },
          I.line2.at,
        )
        .fromTo(
          q('[data-contact="lead"]'),
          { opacity: 0, y: I.lead.y },
          { opacity: 1, y: 0, duration: I.lead.duration, stagger: I.stagger, ...set },
          I.lead.at,
        )
        .fromTo(
          q('[data-contact="rule"]'),
          { scaleX: 0 },
          { scaleX: 1, duration: I.rules.duration, stagger: I.stagger, ...set },
          I.rules.at,
        )
        .fromTo(
          one('[data-contact="cta"]'),
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: I.cta.duration, ...set },
          I.cta.at,
        )
        .fromTo(
          one('[data-contact="cta-arrow"]'),
          { opacity: 0, x: I.cta.arrow.x, y: I.cta.arrow.y },
          { opacity: 1, x: 0, y: 0, duration: I.cta.arrowDuration, ...set },
          I.cta.arrowAt,
        )
        .fromTo(
          one('[data-contact="email"]'),
          { opacity: 0, y: I.email.y },
          { opacity: 1, y: 0, duration: I.email.duration, ...set },
          I.email.at,
        )
        // "Copiar e-mail": aparece da esquerda para a direita — o sublinhado
        // (nativo do texto) se desenha junto, sem mudar como ele é renderizado.
        .fromTo(
          one('[data-contact="copy"]'),
          { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
          { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: I.email.copyDuration, ...set },
          I.email.at + 0.08,
        )
        .fromTo(
          one('[data-contact="copyright"]'),
          { opacity: 0 },
          { opacity: 1, duration: I.footer.duration, ...set },
          I.footer.at,
        )
        .fromTo(
          q('[data-contact="social"]'),
          { opacity: 0, scale: I.footer.socialScale },
          { opacity: 1, scale: 1, duration: I.footer.socialDuration, stagger: I.stagger, ...set },
          I.footer.at,
        )
        // Brilho: aparece junto com a headline; ao terminar, começam os loops.
        .fromTo(
          q("[data-glow-intro]"),
          { opacity: 0, scale: I.glow.scale },
          {
            opacity: 1,
            scale: 1,
            duration: I.glow.duration,
            ...set,
            onComplete: () => {
              glowReady = true;
              if (visible) loops.play();
            },
          },
          I.glow.at,
        );
      // Limpa o clip-path do botão no fim (estado final = estático).
      intro.eventCallback("onComplete", () => {
        gsap.set(one('[data-contact="copy"]'), { clearProps: "clipPath" });
      });

      ScrollTrigger.create({
        trigger: one('[data-contact="index"]'),
        start: I.start,
        once: true,
        onEnter: () => intro.play(),
      });

      // Loops só com a seção visível: pausa ao sair, retoma de onde parou.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
          if (!glowReady) return;
          if (visible) loops.play();
          else loops.pause();
        },
      });
    },
  );

  return { revert: () => mm.revert() };
}
