"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { playHeroIntro } from "@/lib/animations/heroIntro";
import { createSealSpin } from "@/lib/animations/sealSpin";
import { useMessages } from "@/i18n/I18nProvider";
import {
  createHeroParallax,
  HERO_SCROLL,
} from "@/lib/animations/heroParallax";
import styles from "./hero.module.css";

gsap.registerPlugin(useGSAP);

const trackHeight = {
  "--track-h": HERO_SCROLL.wrapperHeight,
  "--track-h-mobile": HERO_SCROLL.wrapperHeightMobile,
} as CSSProperties;

/**
 * Trecho de scroll do Hero: wrapper alto (.track) com a seção sticky dentro.
 * O parallax e a entrada rodam num gsap.context (useGSAP) e são desfeitos
 * ao desmontar.
 */
export default function HeroScene({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { hero } = useMessages();

  useGSAP(
    () => {
      if (!trackRef.current || !heroRef.current) return;
      const parallax = createHeroParallax(trackRef.current, heroRef.current);
      const cancelIntro = playHeroIntro(heroRef.current);
      const sealSpin = createSealSpin(trackRef.current, heroRef.current);
      return () => {
        cancelIntro();
        sealSpin.revert();
        parallax.revert();
      };
    },
    { scope: trackRef },
  );

  return (
    <div ref={trackRef} className={styles.track} style={trackHeight}>
      <section
        ref={heroRef}
        id="inicio"
        aria-label={hero.section}
        className={styles.hero}
        data-nav-theme="dark"
      >
        {children}
      </section>
    </div>
  );
}
