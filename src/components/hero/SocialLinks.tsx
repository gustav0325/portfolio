"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { HoverFill, IconRoll } from "@/components/interactions/HoverFill";
import { socialLinks, whatsappUrl } from "@/config/site";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./hero.module.css";

/**
 * Coluna de redes sociais (node 5:31). URLs em src/config/site.ts.
 * Hover: magnetismo leve, preenchimento branco a partir do ponto de entrada e
 * o ícone rolando para a versão escura (hoverEngine.ts).
 */
export default function SocialLinks() {
  const { social, contact } = useMessages();
  return (
    <ul
      className={styles.social}
      aria-label={social.list}
      data-parallax="social"
    >
      {socialLinks.map(({ id, label, href, icon }) => (
          <li key={id} data-intro="social">
            <a
              className={styles.socialLink}
              // WhatsApp: a mesma mensagem pronta dos CTAs, no idioma atual.
              href={id === "whatsapp" ? whatsappUrl(contact.whatsappMessage) : href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.open} ${label}`}
              style={{ "--iw": icon.width, "--ih": icon.height } as CSSProperties}
              data-hover
              data-magnetic="social"
              data-press
            >
              <HoverFill className={styles.socialFill} tone="light" />
              <IconRoll
                copy={
                  <Image
                    src={icon.src}
                    alt=""
                    width={icon.width}
                    height={icon.height}
                    className={styles.socialIconDark}
                  />
                }
              >
                <Image
                  src={icon.src}
                  alt=""
                  width={icon.width}
                  height={icon.height}
                />
              </IconRoll>
            </a>
          </li>
      ))}
      <li className={styles.vline} aria-hidden data-intro="social">
        <Image src="/hero/line-social.svg" alt="" width={149} height={1} />
      </li>
    </ul>
  );
}
