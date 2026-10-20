"use client";

import type { Stat } from "@/data/about";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./about.module.css";

/** Indicadores numéricos (node 29:20). */
export default function AboutStats({ stats }: { stats: Stat[] }) {
  const { about } = useMessages();
  return (
    <ul className={styles.stats} data-about="stats">
      {stats.map(({ value, key }) => (
        <li key={key} className={styles.stat} data-stat>
          <span className={styles.statValue} data-stat-value={value}>
            {value}
          </span>
          <span className={styles.statLabel}>{about.stats[key]}</span>
        </li>
      ))}
    </ul>
  );
}
