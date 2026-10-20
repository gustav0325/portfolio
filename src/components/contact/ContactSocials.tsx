"use client";

import Image from "next/image";
import { HoverFill, IconRoll } from "@/components/interactions/HoverFill";
import { socialLinks, type SocialLink } from "@/config/site";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./contact.module.css";

// Ícones de traço do rodapé do Contato (nodes 37:2, 37:6, 37:9), na ordem do Figma.
const FOOTER_ICONS: { id: SocialLink["id"]; src: string }[] = [
  { id: "linkedin", src: "/contact/linkedin.svg" },
  { id: "github", src: "/contact/github.svg" },
  { id: "instagram", src: "/contact/instagram.svg" },
];

/**
 * Ícones sociais em círculos (node 35:209). URLs em src/config/site.ts.
 * Hover: magnetismo leve, preenchimento laranja → rosa a partir do ponto de
 * entrada e o ícone rolando (hoverEngine.ts).
 */
export default function ContactSocials() {
  const { social } = useMessages();
  return (
    <ul className={styles.socials} aria-label={social.list}>
      {FOOTER_ICONS.map(({ id, src }) => {
        const link = socialLinks.find((item) => item.id === id);
        if (!link) return null;
        return (
          <li key={id} data-contact="social">
            <a
              className={styles.social}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.open} ${link.label}`}
              data-hover
              data-magnetic="social"
              data-press
            >
              <HoverFill className={styles.socialFill} tone="sunset" />
              <IconRoll>
                <Image src={src} alt="" width={22} height={22} />
              </IconRoll>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
