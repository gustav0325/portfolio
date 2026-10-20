import type { ReactNode } from "react";
import styles from "./interactions.module.css";

/**
 * Seta ↗ com cópia: no hover, a atual sai para cima/direita dentro da máscara
 * e a cópia entra de baixo/esquerda (hoverEngine.ts). Decorativa.
 */
export default function AnimatedArrow({
  children,
  className,
  variant,
}: {
  children: ReactNode;
  className?: string;
  /** Valores do movimento (hoverConfig.ts): padrão ou os dos títulos dos projetos. */
  variant?: "project";
}) {
  return (
    <span
      className={className ? `${styles.arrow} ${className}` : styles.arrow}
      data-arrow={variant ?? ""}
      aria-hidden
    >
      <span className={styles.arrowFace} data-arrow-a>
        {children}
      </span>
      <span className={`${styles.arrowFace} ${styles.arrowCopy}`} data-arrow-b>
        {children}
      </span>
    </span>
  );
}
