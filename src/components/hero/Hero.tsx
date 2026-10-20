import { HeroSubtitle, HeroTitle } from "./HeroContent";
import HeroLayers from "./HeroLayers";
import HeroScene from "./HeroScene";
import ScrollIndicator from "./ScrollIndicator";
import SocialLinks from "./SocialLinks";
import styles from "./hero.module.css";

/**
 * Hero fiel ao frame do Figma, com parallax de scroll (Fase 1).
 * Velocidades em src/lib/animations/heroParallax.ts (SPEEDS); os alvos são
 * marcados com `data-parallax`.
 */
export default function Hero() {
  return (
    <HeroScene>
      <HeroLayers />
      <HeroTitle />

      <div className={styles.ui}>
        <HeroSubtitle />
        <SocialLinks />
        <ScrollIndicator target="#projetos" />
      </div>
    </HeroScene>
  );
}
