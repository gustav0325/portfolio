"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { PROJECT_PIN } from "@/lib/animations/projectsConfig";
import { useI18n } from "@/i18n/I18nProvider";
import { createProjectsMotion } from "@/lib/animations/projectsMotion";
import styles from "./projects.module.css";

gsap.registerPlugin(useGSAP);

// Posição do pin (projects.module.css: --pin-media-top).
const pinVars = {
  "--pin-nav": PROJECT_PIN.navbarBottom,
  "--pin-gap": PROJECT_PIN.gap,
  "--pin-indicator-shift": PROJECT_PIN.indicatorShift,
} as CSSProperties;

/**
 * A <section> de Projetos com a animação: pilha de cards no scroll e entradas
 * de conteúdo. Roda num gsap.context (useGSAP) e é desfeita ao desmontar.
 */
export default function ProjectsScene({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const motionRef = useRef<ReturnType<typeof createProjectsMotion>>(null);
  const { locale } = useI18n();
  const renderedLocale = useRef(locale);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const motion = createProjectsMotion(sectionRef.current);
      motionRef.current = motion;
      return () => {
        motionRef.current = null;
        motion.revert();
      };
    },
    { scope: sectionRef },
  );

  // Troca de idioma: o pin só é refeito se o texto novo mudou a altura da
  // coluna (o ScrollTrigger.refresh vem logo depois, do I18nProvider).
  useLayoutEffect(() => {
    if (renderedLocale.current === locale) return;
    renderedLocale.current = locale;
    motionRef.current?.relayout();
  }, [locale]);

  return (
    <section
      ref={sectionRef}
      id="projetos"
      aria-labelledby="projetos-titulo"
      className={styles.section}
      style={pinVars}
      data-nav-theme="light"
    >
      {children}
    </section>
  );
}
