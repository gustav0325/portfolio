"use client";

import AnimatedArrow from "@/components/interactions/AnimatedArrow";
import TextRoll from "@/components/interactions/TextRoll";
import { contactEmail, whatsappUrl } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import ContactGlow from "./ContactGlow";
import ContactScene from "./ContactScene";
import ContactSocials from "./ContactSocials";
import CopyEmailButton from "./CopyEmailButton";
import styles from "./contact.module.css";

/**
 * Seção Contato (frame 30:106). Animação em src/lib/animations/contactMotion.ts
 * (valores em contactConfig.ts); os alvos são marcados com data-contact.
 */
export default function ContactSection() {
  const { locale, messages } = useI18n();
  const { contact } = messages;
  return (
    <ContactScene>
      <div className={styles.frame}>
        <ContactGlow />

        <p className={styles.index} data-contact="index">
          03
          <span className={styles.indexLine} aria-hidden data-contact="index-line" />
          <span className={styles.indexLabel}>{contact.label}</span>
        </p>

        {/* Cada linha numa máscara; a linha com degradê é ela mesma que se move. */}
        <h2 id="contato-titulo" className={styles.headline}>
          <span className={styles.headlineMask}>
            <span className={styles.headlineLine} data-contact="line">
              {contact.headlineLine1}
            </span>
          </span>{" "}
          <span className={styles.headlineMask}>
            <span className={`${styles.headlineLine} ${styles.headlineMuted}`} data-contact="line">
              {contact.headlineLine2}
            </span>
          </span>
        </h2>

        <p className={styles.lead}>
          <span data-contact="lead">{contact.lead1}</span>{" "}
          <span data-contact="lead">{contact.lead2}</span>
        </p>

        <div className={`${styles.rule} ${styles.ruleTop}`} aria-hidden data-contact="rule" />

        {/*
          Abre a conversa no WhatsApp, com a mensagem pronta no idioma atual.
          Hover (hoverEngine.ts): texto rola, seta sai e volta, o conteúdo
          avança alguns px, a linha inferior ganha o rosa e o brilho à direita
          se intensifica (data-react="contact" → data-react-to="contact").
        */}
        <a
          className={styles.cta}
          href={whatsappUrl(contact.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          data-hover
          data-react="contact"
          data-press
        >
          <span className={styles.ctaInner} data-shift data-press-target>
            <span className={styles.ctaLabel}>
              <span className={styles.ctaMask}>
                <span className={styles.ctaText} data-contact="cta">
                  <TextRoll key={locale} text={contact.cta} />
                </span>
              </span>
            </span>
            <span className={styles.ctaArrow} aria-hidden data-contact="cta-arrow">
              <AnimatedArrow>↗</AnimatedArrow>
            </span>
          </span>
        </a>

        <div className={styles.emailRow}>
          <span className={styles.email} data-contact="email">
            {contactEmail}
          </span>
          <CopyEmailButton email={contactEmail} />
        </div>

        <div className={`${styles.rule} ${styles.ruleBottom}`} aria-hidden data-contact="rule">
          <span className={styles.ruleFill} data-react-to="contact" data-line-fill />
        </div>

        <footer className={styles.footer}>
          <p className={styles.copyright} data-contact="copyright">
            {contact.copyright}
          </p>
          <ContactSocials />
        </footer>
      </div>
    </ContactScene>
  );
}
