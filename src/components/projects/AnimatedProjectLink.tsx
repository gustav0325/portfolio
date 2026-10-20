import Image from "next/image";
import AnimatedArrow from "@/components/interactions/AnimatedArrow";
import TextRoll from "@/components/interactions/TextRoll";
import styles from "./projects.module.css";

/**
 * Título de um projeto com a seta ↗ (node 35:214). Com `url`, título e seta
 * formam um único link para o site, em nova aba, com o hover editorial
 * (hoverEngine.ts, valores em PROJECT_LINK_HOVER): o texto rola, a seta sai
 * e volta e um sublinhado rosa se desenha. O hover só anima camadas
 * internas do link — nunca o card, a coluna ou o palco que o scroll move. Sem `url`, fica estático: nada sugere um clique
 * que não existe.
 *
 * O título fica numa máscara e a seta tem `data-content`: são os alvos da
 * entrada do conteúdo (projectContent.ts).
 */
export default function AnimatedProjectLink({ title, url }: { title: string; url?: string }) {
  const arrow = <Image src="/projects/ui/arrow.svg" alt="" width={18} height={16} />;

  if (!url) {
    return (
      <>
        <span className={styles.titleMask}>
          <span className={styles.titleText} data-content="title">
            {title}
          </span>
        </span>
        <span className={styles.arrow} data-content="arrow" aria-hidden>
          {arrow}
        </span>
      </>
    );
  }

  return (
    <a
      className={styles.titleLink}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-hover
      data-hover-track
    >
      <span className={styles.titleMask}>
        <span className={styles.titleText} data-content="title">
          <TextRoll text={title} variant="project" />
        </span>
      </span>
      <span className={styles.arrow} data-content="arrow" aria-hidden>
        <AnimatedArrow className={styles.arrowRoll} variant="project">
          {arrow}
        </AnimatedArrow>
      </span>
      <span className={styles.titleLine} aria-hidden data-line-draw />
    </a>
  );
}
