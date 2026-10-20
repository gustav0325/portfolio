import Image from "next/image";
import { CONTACT_MOTION } from "@/lib/animations/contactConfig";
import styles from "./contact.module.css";

const RINGS = Array.from({ length: CONTACT_MOTION.waves.desktopCount }, (_, i) => i);

/**
 * Brilho rosa desfocado e arco fino (nodes 33:2 e 33:3), decorativos. Cada
 * camada tem um único dono de transform/opacidade (contactMotion.ts):
 *   .glowBox / .arcBox  [data-glow-intro]   entrada (uma vez)
 *   .glowDrift          [data-glow-drift]   deriva lenta x/y (loop)
 *   .glowBreath         [data-glow-breath]  respiração: escala + opacidade (loop)
 *   .glowPeach          [data-glow-peach]   tom pêssego: só opacidade (loop)
 *   .ring               [data-glow-ring]    anéis: escala + opacidade (loop)
 *   .glowLayer          [data-glow-react]   hover do CTA: escala leve, --glow-boost
 *                                           (.glowBoost) e --ring-color (hoverEngine.ts)
 * Sem animação (estático, movimento reduzido), fica exatamente como no Figma:
 * pêssego e anéis com opacidade 0.
 */
export default function ContactGlow() {
  return (
    <div className={styles.glowLayer} aria-hidden data-react-to="contact" data-glow-react>
      <div className={styles.glowBox} data-glow-intro>
        <div className={styles.glowDrift} data-glow-drift>
          <div className={styles.glowBreath} data-glow-breath>
            <Image src="/contact/glow.svg" alt="" width={620} height={620} className={styles.glow} />
            <div className={styles.glowPeach} data-glow-peach />
            <div className={styles.glowBoost} />
          </div>
        </div>
      </div>
      <div className={styles.arcBox} data-glow-intro>
        <Image src="/contact/arc.svg" alt="" width={480} height={480} className={styles.arc} />
        {RINGS.map((i) => (
          <span key={i} className={styles.ring} data-glow-ring />
        ))}
      </div>
    </div>
  );
}
