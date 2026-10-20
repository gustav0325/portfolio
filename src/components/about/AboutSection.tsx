"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import AnimatedArrow from "@/components/interactions/AnimatedArrow";
import TextRoll from "@/components/interactions/TextRoll";
import { whatsappUrl } from "@/config/site";
import { serviceAreas, stats, tools } from "@/data/about";
import { useI18n } from "@/i18n/I18nProvider";
import { ABOUT_MOTION } from "@/lib/animations/aboutConfig";
import AboutScene from "./AboutScene";
import AboutServices from "./AboutServices";
import AboutStats from "./AboutStats";
import AboutVisual from "./AboutVisual";
import ScrollTextReveal from "./ScrollTextReveal";
import styles from "./about.module.css";

/**
 * Seção Sobre (frame 26:56). Animação em src/lib/animations/aboutMotion.ts
 * (valores em aboutConfig.ts); os alvos são marcados com data-*. Os textos
 * divididos em letras/palavras ganham `key` do idioma: ao trocar, são nós
 * novos, e a revelação no scroll é refeita para eles (AboutScene.tsx).
 */
export default function AboutSection() {
  const { locale, messages } = useI18n();
  const { about, contact } = messages;
  return (
    <AboutScene>
      <p className={styles.index} data-about="index">
        02
      </p>

      <h2
        id="sobre-titulo"
        className={styles.headline}
        data-about="headline"
        data-accent-period={ABOUT_MOTION.headline.accentPeriod}
        style={{ "--accent": ABOUT_MOTION.headline.accentColor } as CSSProperties}
      >
        <span>
          <ScrollTextReveal key={locale} text={about.headlineLine1} by="chars" />
        </span>{" "}
        <span className={styles.headlineMuted} data-reveal-gradient>
          <ScrollTextReveal key={locale} text={about.headlineLine2} by="chars" markLast />
        </span>
      </h2>

      <AboutVisual />

      <div className={styles.column}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{about.eyebrow}</p>
          <div className={styles.introBody}>
            <p className={styles.statement} data-about="statement">
              <span data-reveal-line>{about.statement.line1}</span>{" "}
              <span>
                <strong data-reveal-strong>{about.statement.strong}</strong>
                <span data-reveal-line>{about.statement.line2}</span>
              </span>{" "}
              <span data-reveal-line>{about.statement.line3}</span>
            </p>
            <p className={styles.paragraph} data-about="paragraph">
              <ScrollTextReveal key={locale} text={about.paragraph} by="words" />
            </p>
          </div>
        </div>

        <div className={styles.rule} aria-hidden />
        <AboutStats stats={stats} />
        <div className={styles.rule} aria-hidden />

        <div className={styles.tools} data-about="tools">
          <h3 id="ferramentas" className={styles.eyebrow} data-reveal-item>
            {about.tools}
          </h3>
          <ul className={styles.toolList} aria-labelledby="ferramentas">
            {tools.map((tool, i) => (
              <li key={tool} className={styles.tool} data-reveal-item>
                {i > 0 && <Image src="/about/dot.svg" alt="" width={3} height={3} />}
                {tool}
              </li>
            ))}
          </ul>
        </div>

        {/*
          Abre a conversa no WhatsApp, com a mensagem pronta no idioma atual.
          Hover (hoverEngine.ts): magnetismo leve, texto rola, sublinhado e seta.
        */}
        <a
          className={styles.cta}
          href={whatsappUrl(contact.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          data-about="cta"
          data-hover
          data-magnetic="link"
          data-press
        >
          <span className={styles.ctaInner} data-magnetic-inner data-press-target>
            <span className={styles.ctaLabel} data-cta-label data-underline>
              <TextRoll key={locale} text={about.cta} />
            </span>
            <span className={styles.ctaArrow} aria-hidden data-cta-arrow>
              <AnimatedArrow>↗</AnimatedArrow>
            </span>
          </span>
        </a>
      </div>

      <AboutServices areas={serviceAreas} />
    </AboutScene>
  );
}
