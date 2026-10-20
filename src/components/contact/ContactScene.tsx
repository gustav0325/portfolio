"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { createContactMotion } from "@/lib/animations/contactMotion";
import styles from "./contact.module.css";

gsap.registerPlugin(useGSAP);

/**
 * A <section> Contato com a animação (contactMotion.ts). Roda num
 * gsap.context (useGSAP) e é desfeita ao desmontar.
 */
export default function ContactScene({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const motion = createContactMotion(sectionRef.current);
      return () => motion.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="contato"
      aria-labelledby="contato-titulo"
      className={styles.section}
      data-nav-theme="light"
    >
      {children}
    </section>
  );
}
