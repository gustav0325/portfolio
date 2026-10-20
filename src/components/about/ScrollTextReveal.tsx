import styles from "./about.module.css";

type ScrollTextRevealProps = {
  text: string;
  /** "chars": uma letra por span; "words": uma palavra por span. */
  by: "chars" | "words";
  /** Marca o último caractere (o ponto final) para a cor de destaque. */
  markLast?: boolean;
};

/**
 * Divide um texto para a revelação no scroll (aboutMotion.ts) sem mudar o
 * layout: cada letra/palavra vira um <span data-reveal-unit> inline, e os
 * espaços continuam como texto comum — as quebras de linha são as mesmas.
 * Os pedaços ficam com aria-hidden; o texto inteiro vai num span só para
 * leitores de tela (que não anunciam letra por letra).
 */
export default function ScrollTextReveal({ text, by, markLast = false }: ScrollTextRevealProps) {
  const words = text.split(" ");
  const last = text.length - 1;
  // Posição de cada palavra no texto (para achar o último caractere).
  const starts = words.map((_, w) =>
    words.slice(0, w).reduce((sum, word) => sum + word.length + 1, 0),
  );

  return (
    <>
      <span className={styles.srOnly}>{text}</span>
      <span aria-hidden>
        {words.map((word, w) => {
          const start = starts[w];
          const content =
            by === "words" ? (
              <span data-reveal-unit>{word}</span>
            ) : (
              Array.from(word).map((char, c) => (
                <span
                  key={c}
                  data-reveal-unit
                  data-accent={markLast && start + c === last ? "" : undefined}
                >
                  {char}
                </span>
              ))
            );
          return (
            <span key={w}>
              {w > 0 && " "}
              {content}
            </span>
          );
        })}
      </span>
    </>
  );
}
