"use client";

import { useMessages } from "@/i18n/I18nProvider";
import styles from "./hero.module.css";

/*
 * Texto do node 14:96: 32 posições a cada 11,25°, espaços inclusos. As duas
 * versões (messages → hero.ring) têm 32 caracteres, então o diâmetro e o
 * espaçamento das letras são os mesmos em português e em inglês.
 */
const SLOTS = 32;
const STEP = 360 / SLOTS;

export default function ScrollIndicator({ target }: { target: `#${string}` }) {
  const { hero } = useMessages();
  return (
    <a
      href={target}
      className={styles.indicator}
      aria-label={hero.scroll}
      data-parallax="seal"
    >
      <span className={styles.ring} aria-hidden data-intro="seal">
        {/* Só este wrapper gira (sealSpin.ts); entrada e parallax ficam nos de fora. */}
        <span className={styles.ringSpin} data-seal-spin>
          {Array.from(hero.ring).map((char, i) =>
            char === " " ? null : (
              <span
                key={i}
                className={styles.glyph}
                style={{ rotate: `${i * STEP}deg` }}
              >
                {char}
              </span>
            ),
          )}
        </span>
      </span>
    </a>
  );
}
