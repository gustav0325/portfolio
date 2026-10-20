"use client";

import { gsap } from "gsap";
import { useEffect, useSyncExternalStore } from "react";
import { createHoverEngine, createPressFeedback } from "@/lib/interactions/hoverEngine";

/** Mouse de verdade e movimento permitido: magnetismo e hovers animados. */
const POINTER_HOVER = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

/**
 * Liga as microinterações globais: o motor de hovers (hoverEngine.ts), só
 * com mouse e sem movimento reduzido, e o feedback de clique, que vale
 * também para toque. Não renderiza nada — o cursor é o nativo.
 */
export default function InteractionLayer() {
  const enabled = useMedia(POINTER_HOVER);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => createPressFeedback());
    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const engine = createHoverEngine();
    return () => engine.destroy();
  }, [enabled]);

  return null;
}
