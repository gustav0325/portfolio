"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/i18n/I18nProvider";
import { createAboutMotion } from "@/lib/animations/aboutMotion";
import styles from "./about.module.css";

gsap.registerPlugin(useGSAP);

/**
 * A <section> Sobre com a animação (aboutMotion.ts). Roda num gsap.context
 * (useGSAP) e é desfeita ao desmontar. Ao trocar o idioma, só a revelação
 * dos textos divididos em letras/palavras é refeita — antes de pintar, para
 * nenhum texto aparecer no estado errado.
 */
export default function AboutScene({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const motionRef = useRef<ReturnType<typeof createAboutMotion>>(null);
  const { locale } = useI18n();
  const renderedLocale = useRef(locale);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const motion = createAboutMotion(sectionRef.current);
      motionRef.current = motion;
      return () => {
        motionRef.current = null;
        motion.revert();
      };
    },
    { scope: sectionRef },
  );

  useLayoutEffect(() => {
    if (renderedLocale.current === locale) return;
    renderedLocale.current = locale;
    motionRef.current?.rebuildText();
  }, [locale]);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      aria-labelledby="sobre-titulo"
      className={styles.section}
      data-nav-theme="dark-glass"
    >
      {children}
    </section>
  );
}
