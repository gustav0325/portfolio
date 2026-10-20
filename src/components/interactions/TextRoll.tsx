import { Fragment } from "react";
import styles from "./interactions.module.css";

type TextRollProps = {
  text: string;
  /** "chars": letra por letra (CTAs, títulos); "line": o texto inteiro de uma vez. */
  by?: "chars" | "line";
  className?: string;
  /** Classe do texto original (o que aparece em repouso). */
  staticClassName?: string;
  /** Valores do movimento (hoverConfig.ts): padrão ou os dos títulos dos projetos. */
  variant?: "project";
};

/**
 * Texto que rola no hover (as letras sobem, a cópia entra por baixo). Leitores
 * de tela leem só o texto original; a versão dividida é decorativa. Anima
 * quando está dentro de um elemento com `data-hover` (hoverEngine.ts).
 */
export default function TextRoll({
  text,
  by = "chars",
  className,
  staticClassName,
  variant,
}: TextRollProps) {
  const words = by === "line" ? [text] : text.split(" ");
  return (
    <span className={className ? `${styles.roll} ${className}` : styles.roll} data-roll={variant ?? ""}>
      <span className={staticClassName ? `${styles.rollStatic} ${staticClassName}` : styles.rollStatic}>
        {text}
      </span>
      <span className={styles.rollSplit} aria-hidden>
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className={styles.rollWord}>
              {(by === "line" ? [word] : Array.from(word)).map((unit, j) => (
                <span key={j} className={styles.rollUnit} data-roll-unit>
                  {unit}
                  <span className={styles.rollCopy}>{unit}</span>
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
