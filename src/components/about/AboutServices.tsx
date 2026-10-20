"use client";

import type { ServiceArea } from "@/data/about";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./about.module.css";

/** Rodapé interno "Áreas de atuação" (nodes 29:50–29:71). */
export default function AboutServices({ areas }: { areas: ServiceArea[] }) {
  const { about } = useMessages();
  return (
    <>
      <div className={styles.footerRule} aria-hidden data-about="services-rule" />
      <h3
        id="areas-de-atuacao"
        className={`${styles.eyebrow} ${styles.areasLabel}`}
        data-about="services-label"
      >
        {about.areasLabel}
      </h3>
      <ul className={styles.areas} aria-labelledby="areas-de-atuacao" data-about="services">
        {areas.map(({ id, key }) => (
          <li key={id} className={styles.area} data-reveal-item>
            <span className={styles.areaName}>
              <span className={styles.areaNumber}>{id}</span>
              {about.areas[key]}
            </span>
            <span className={styles.areaArrow} aria-hidden>
              ↗
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
