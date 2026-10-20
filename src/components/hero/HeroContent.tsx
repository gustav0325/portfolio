"use client";

import Image from "next/image";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./hero.module.css";

/**
 * "Welcome to / Portfólio" (node 3:5). Fica atrás do prédio na pilha. Cada
 * linha é uma máscara para a entrada; o parallax move o h1 inteiro.
 */
export function HeroTitle() {
  const { hero } = useMessages();
  return (
    <h1 className={styles.title} data-parallax="title">
      <span className={`${styles.line} ${styles.welcomeLine}`}>
        <span className={styles.welcome} data-intro="title">
          Welcome to
        </span>
      </span>
      <span className={styles.line}>
        <span className={styles.portfolio} data-intro="title">
          {hero.title}
        </span>
      </span>
    </h1>
  );
}

/** Subtítulo com a linha vertical (node 10:63). */
export function HeroSubtitle() {
  const { hero } = useMessages();
  return (
    <div className={styles.subtitle} data-parallax="tagline">
      <span className={styles.vline} aria-hidden data-intro="tagline">
        <Image src="/hero/line-subtitle.svg" alt="" width={95} height={1} />
      </span>
      <p data-intro="tagline">{hero.tagline}</p>
    </div>
  );
}
