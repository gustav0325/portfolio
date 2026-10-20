import type { ReactNode } from "react";
import styles from "./interactions.module.css";

/**
 * Camadas exclusivas do hover do print de um projeto: o zoom discreto vai
 * numa camada interna própria (nunca no elemento que o scroll move) e o
 * reflexo radial fica por cima, sem receber cliques. O elemento que contém
 * isto leva `data-hover data-spotlight` (hoverEngine.ts).
 */
export default function ProjectSpotlight({ children }: { children: ReactNode }) {
  return (
    <>
      <div className={styles.zoomLayer} data-zoom>
        {children}
      </div>
      <span className={styles.spotlight} aria-hidden data-spotlight-glow />
    </>
  );
}
