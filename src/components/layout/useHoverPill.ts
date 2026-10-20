import { gsap } from "gsap";
import { useEffect, type RefObject } from "react";
import { HOVER_MOTION } from "@/lib/interactions/hoverConfig";

/**
 * Pílula translúcida que desliza até o link sob o mouse — só representa o
 * hover; o indicador da seção ativa (useActiveIndicator.ts) continua
 * independente. Aparece no lugar ao entrar na lista, desliza entre links e
 * some ao sair. Só com mouse; com movimento reduzido, troca sem deslizar.
 */
export function useHoverPill(
  listRef: RefObject<HTMLElement | null>,
  pillRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const { duration, fade, padX, padY } = HOVER_MOTION.navPill;

    const place = (link: HTMLElement) => {
      const box = list.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(link).fontSize);
      const target = {
        x: rect.left - box.left - padX * em,
        y: rect.top - box.top - padY * em,
        width: rect.width + 2 * padX * em,
        height: rect.height + 2 * padY * em,
      };
      // Ainda visível (deslizando ou sumindo): desliza; senão, surge no lugar.
      const visible = Number(gsap.getProperty(pill, "opacity")) > 0.05;
      if (visible && !reduce.matches) {
        gsap.to(pill, { ...target, duration, ease: HOVER_MOTION.ease, overwrite: "auto" });
      } else {
        gsap.killTweensOf(pill, "x,y,width,height");
        gsap.set(pill, target);
      }
      gsap.to(pill, { opacity: 1, duration: fade, ease: "power1.out", overwrite: "auto" });
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      const link = (e.target as Element).closest<HTMLElement>("a");
      if (link && list.contains(link)) place(link);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      gsap.to(pill, { opacity: 0, duration: fade, ease: "power1.out", overwrite: "auto" });
    };

    list.addEventListener("pointerover", onOver);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      list.removeEventListener("pointerover", onOver);
      list.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(pill);
      gsap.set(pill, { clearProps: "transform,width,height,opacity" });
    };
  }, [listRef, pillRef]);
}
