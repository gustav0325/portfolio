import type { ReactNode } from "react";
import styles from "./interactions.module.css";

/**
 * Preenchimento circular do botão: um disco que cresce a partir do ponto
 * onde o cursor entra (hoverEngine.ts). Fica atrás do conteúdo, numa caixa
 * posicionada pelo `className` (o botão precisa de `isolation: isolate`).
 *   tone="light"  branco (sobre o Hero colorido)
 *   tone="sunset" laranja → rosa (sobre fundos claros)
 */
export function HoverFill({ className, tone }: { className?: string; tone: "light" | "sunset" }) {
  return (
    <span className={className ? `${styles.fillBox} ${className}` : styles.fillBox} aria-hidden>
      <span className={styles.fill} data-fill>
        <span className={styles.fillPaint} data-fill-paint data-tone={tone} />
      </span>
    </span>
  );
}

/**
 * Ícone que rola no hover: o atual sobe e sai, a cópia (`copy`, ou o mesmo
 * ícone) entra por baixo. A cópia é decorativa (aria-hidden).
 */
export function IconRoll({ children, copy }: { children: ReactNode; copy?: ReactNode }) {
  return (
    <span className={styles.iconRoll} data-roll="icon">
      <span className={styles.iconUnit} data-roll-unit>
        {children}
        <span className={styles.rollCopy} aria-hidden>
          {copy ?? children}
        </span>
      </span>
    </span>
  );
}
