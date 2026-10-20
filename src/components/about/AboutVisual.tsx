"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/I18nProvider";
import { ABOUT_PHOTO_MOTION } from "@/lib/animations/aboutConfig";
import styles from "./about.module.css";

/** Folga da imagem para o parallax (a mesma distância que a animação percorre). */
const parallaxRoom = {
  "--photo-room": `${ABOUT_PHOTO_MOTION.parallax.distance}px`,
  "--photo-room-mobile": `${ABOUT_PHOTO_MOTION.parallax.mobileDistance}px`,
} as CSSProperties;

/**
 * Fotografia (mask group 60:3): o retrato "perfil-paris" (60:2) na moldura de
 * 458×446, alinhado pela base e cortado no topo, como no Figma. Cada camada
 * tem um único dono de animação (aboutMotion.ts):
 *   .visual          moldura (posição e tamanho fixos)
 *   .photoReveal     [data-photo-reveal]    cortina de baixo para cima (clip-path)
 *   .photoParallax   [data-photo-parallax]  deslocamento vertical (scroll)
 * Sem animação (JS desligado, movimento reduzido), a foto aparece inteira.
 */
export default function AboutVisual() {
  const { about } = useMessages();
  return (
    <div className={styles.visual} data-about="photo" style={parallaxRoom}>
      <div className={styles.photoReveal} data-photo-reveal>
        <div className={styles.photoParallax} data-photo-parallax>
          <Image
            className={styles.photo}
            src="/about/perfil-paris.png"
            alt={about.photoAlt}
            width={1086}
            height={1448}
            quality={90}
            sizes="(min-width: 1024px) 34vw, 100vw"
          />
        </div>
      </div>
    </div>
  );
}
