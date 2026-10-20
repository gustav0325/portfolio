"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import TextRoll from "@/components/interactions/TextRoll";
import { useMessages } from "@/i18n/I18nProvider";
import { HOVER_MOTION } from "@/lib/interactions/hoverConfig";
import styles from "./contact.module.css";

type Status = "idle" | "copied" | "error";

/** Quanto tempo a confirmação fica na tela antes de voltar ao texto original. */
const RESET_AFTER = 2000;

/** Cópia sem a API de clipboard (contextos não seguros, navegadores antigos). */
function legacyCopy(text: string) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

/**
 * "Copiar e-mail" (node 33:17). Copia o endereço real; só confirma
 * ("Copiado ✓", com um pulso curto) se a cópia deu certo, e volta ao texto
 * original depois de 2s. Se falhar, avisa de forma discreta — o e-mail
 * continua visível ao lado. O resultado também é anunciado para leitores de
 * tela (aria-live). Hover (hoverEngine.ts): o texto rola inteiro e o
 * sublinhado retrai e se redesenha.
 */
export default function CopyEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const { copy: texts } = useMessages().contact;
  const labelText = texts[status];
  const announce = status === "copied" ? texts.announceCopied : status === "error" ? texts.announceError : "";
  const timer = useRef<number | undefined>(undefined);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Pulso sutil na confirmação (sem movimento com a preferência reduzida).
  useEffect(() => {
    const label = labelRef.current;
    if (status !== "copied" || !label) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { scale, duration } = HOVER_MOTION.copyPulse;
    const pulse = gsap.fromTo(
      label,
      { scale: 1 },
      { scale, duration, ease: "power2.out", yoyo: true, repeat: 1 },
    );
    return () => {
      pulse.kill();
      gsap.set(label, { clearProps: "scale" });
    };
  }, [status]);

  const copy = async () => {
    window.clearTimeout(timer.current);
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      ok = legacyCopy(email);
    }
    setStatus(ok ? "copied" : "error");
    timer.current = window.setTimeout(() => setStatus("idle"), RESET_AFTER);
  };

  return (
    <>
      <button
        type="button"
        className={styles.copy}
        onClick={copy}
        data-contact="copy"
        data-hover
        data-press
      >
        <span ref={labelRef} className={styles.copyLabel}>
          {/* Novo texto = nova rolagem, do estado inicial. */}
          <TextRoll key={labelText} text={labelText} by="line" staticClassName={styles.copyText} />
        </span>
        <span className={styles.copyLine} aria-hidden data-underline />
      </button>
      <span className={styles.srOnly} role="status" aria-live="polite">
        {announce}
      </span>
    </>
  );
}
