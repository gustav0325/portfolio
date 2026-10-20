import { gsap } from "gsap";
import { useEffect, useRef, type RefObject } from "react";

/** Movimento do indicador do link ativo. */
export const INDICATOR_MOTION = {
  /** Deslize entre links. */
  duration: 0.55,
  ease: "power3.inOut",
  /**
   * Aparecer/sumir (entrando ou saindo do Hero, onde nenhum link fica ativo).
   * 0 = instantâneo, como no comportamento aprovado.
   */
  appear: 0,
} as const;

/**
 * Linha sob um link: deslocamento e largura em px do Figma (texto de 20px) e
 * lado do degradê. width "auto" = a largura do texto menos o deslocamento dos
 * dois lados (para textos sem medida no Figma, como os em inglês).
 */
export type IndicatorLine = { left: number; width: number | "auto"; fade: "right" | "left" };

/** Largura de referência do elemento (px); a largura real vem do scaleX. */
const BASE_WIDTH = 100;

/**
 * Um único indicador para todos os links: lê a posição do link ativo
 * (getBoundingClientRect) e desliza até ele com x/scaleX. Se a seção mudar
 * no meio do deslize, o GSAP parte da posição atual (overwrite). O degradê
 * troca de lado por cross-fade de duas camadas (data-fade="right"/"left").
 * Usa o estado `activeHref` que a navbar já calcula — nenhum listener de
 * scroll novo. Recalcula com resize e com as fontes carregadas.
 */
export function useActiveIndicator(
  listRef: RefObject<HTMLElement | null>,
  indicatorRef: RefObject<HTMLElement | null>,
  activeHref: string | undefined,
  lines: Record<string, IndicatorLine>,
) {
  const shown = useRef(false);
  const current = useRef(activeHref);
  const placeRef = useRef<(animate: boolean) => void>(() => {});

  // Posiciona (ou desliza) o indicador até o link ativo.
  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const [right, left] = Array.from(indicator.children) as HTMLElement[];

    /** Posição de destino, ou null se não há link ativo visível (Hero, menu mobile). */
    const measure = (href: string | undefined) => {
      const line = href ? lines[href] : undefined;
      const link = href ? list.querySelector<HTMLElement>(`a[href="${href}"]`) : null;
      const box = list.getBoundingClientRect();
      if (!line || !link || box.width === 0) return null;
      const rect = link.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(link).fontSize);
      const offset = (line.left / 20) * em;
      const width = line.width === "auto" ? rect.width - 2 * offset : (line.width / 20) * em;
      return {
        x: rect.left - box.left + offset,
        y: rect.bottom - box.top + 0.125 * em,
        scaleX: width / BASE_WIDTH,
        fadeLeft: line.fade === "left" ? 1 : 0,
      };
    };

    /** Coloca o indicador no destino; com `animate`, desliza a partir de onde está. */
    placeRef.current = (animate: boolean) => {
      const target = measure(current.current);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!target) {
        if (shown.current) {
          gsap.to(indicator, { opacity: 0, duration: INDICATOR_MOTION.appear, overwrite: "auto" });
        }
        shown.current = false;
        return;
      }
      const position = { x: target.x, y: target.y, scaleX: target.scaleX };
      const fades = [
        [right, 1 - target.fadeLeft],
        [left, target.fadeLeft],
      ] as const;
      if (animate && shown.current && !reduce) {
        const motion = {
          duration: INDICATOR_MOTION.duration,
          ease: INDICATOR_MOTION.ease,
          overwrite: "auto" as const,
        };
        gsap.to(indicator, { ...position, ...motion });
        fades.forEach(([layer, opacity]) => gsap.to(layer, { opacity, ...motion }));
      } else {
        // Primeira vez (ou sem animação): direto no lugar, sem atravessar a navbar.
        gsap.killTweensOf([indicator, right, left], "x,y,scaleX,opacity");
        gsap.set(indicator, position);
        fades.forEach(([layer, opacity]) => gsap.set(layer, { opacity }));
        if (!shown.current) {
          gsap.to(indicator, {
            opacity: 1,
            duration: reduce ? 0 : INDICATOR_MOTION.appear,
            overwrite: "auto",
          });
        }
      }
      shown.current = true;
    };

    current.current = activeHref;
    placeRef.current(true);
  }, [activeHref, lines, listRef, indicatorRef]);

  // Geometria muda com resize (e quando a lista aparece/some no breakpoint) e
  // quando as fontes terminam de carregar: reposiciona sem animar. Só reage a
  // mudanças reais de tamanho (o ResizeObserver avisa uma vez ao começar).
  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list) return;
    let size = "";
    const observer = new ResizeObserver(([entry]) => {
      const next = `${entry.contentRect.width}x${entry.contentRect.height}`;
      if (size && next !== size) placeRef.current(false);
      size = next;
    });
    observer.observe(list);
    let alive = true;
    if (document.fonts?.status === "loading") {
      document.fonts.ready.then(() => {
        if (alive) placeRef.current(false);
      });
    }
    return () => {
      alive = false;
      observer.disconnect();
      if (indicator) gsap.killTweensOf([indicator, ...Array.from(indicator.children)]);
    };
  }, [listRef, indicatorRef]);
}
