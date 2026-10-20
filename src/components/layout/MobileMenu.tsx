"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { navLinks, socialLinks, whatsappUrl, type SocialLink } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageChoice } from "./LanguageSwitcher";
import LogoRD from "./LogoRD";
import styles from "./mobileMenu.module.css";

/** Abertura do menu (fechar é a mesma animação ao contrário, um pouco mais rápida). */
const MENU_MOTION = {
  fade: 0.3,
  ease: "power3.out",
  y: 20,
  itemDuration: 0.32,
  stagger: 0.08,
  closeSpeed: 1.5,
} as const;

/** Ordem dos ícones no menu. */
const MENU_SOCIALS: SocialLink["id"][] = ["instagram", "github", "linkedin", "whatsapp"];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Menu em tela cheia (< 1024px). Fica sempre na página, invisível e inerte
 * quando fechado, para poder animar a saída. Abre com o fundo surgindo e as
 * linhas subindo em sequência. Enquanto aberto: a página atrás não rola (sem
 * mudar a posição de scroll — o ScrollTrigger não percebe nada), o foco fica
 * dentro do menu e Esc fecha; ao fechar, o foco volta ao botão do menu.
 */
export default function MobileMenu({
  id,
  open,
  onClose,
  toggleRef,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const { messages } = useI18n();
  const { nav, social, contact } = messages;
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);
  const wasOpen = useRef(false);

  // Timeline única de abrir/fechar.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const { fade, ease, y, itemDuration, stagger } = MENU_MOTION;
    const items = root.querySelectorAll("[data-menu-item]");
    // Visibilidade à parte (visível já ao abrir, para receber o foco; oculto
    // só no fim da saída); a timeline anima a opacidade.
    const tl = gsap
      .timeline({
        paused: true,
        defaults: { ease },
        onReverseComplete: () => gsap.set(root, { visibility: "hidden" }),
      })
      .fromTo(root, { opacity: 0 }, { opacity: 1, duration: fade }, 0)
      .fromTo(items, { y, opacity: 0 }, { y: 0, opacity: 1, duration: itemDuration, stagger }, 0.05);
    timeline.current = tl;
    return () => {
      tl.kill();
      gsap.set([root, ...items], { clearProps: "all" });
      timeline.current = null;
    };
  }, []);

  // Página parada atrás do menu: só o <html> deixa de rolar (a posição de
  // scroll não muda). A largura da barra de rolagem é compensada. Em layout
  // effect: ao tocar num link, a página já está liberada quando o navegador
  // segue a âncora.
  useLayoutEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const gutter = window.innerWidth - html.clientWidth;
    const previous = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (gutter > 0) html.style.paddingRight = `${gutter}px`;
    return () => {
      html.style.overflow = previous.overflow;
      html.style.paddingRight = previous.paddingRight;
    };
  }, [open]);

  // Abre/fecha: animação, foco e Esc.
  useEffect(() => {
    const root = rootRef.current;
    const tl = timeline.current;
    if (!root || !tl) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      wasOpen.current = true;
      gsap.set(root, { visibility: "visible" });
      if (reduce) tl.progress(1).pause();
      else tl.timeScale(1).play();
      closeRef.current?.focus();
      const onKey = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (reduce) {
      tl.progress(0).pause();
      gsap.set(root, { visibility: "hidden" });
    } else tl.timeScale(MENU_MOTION.closeSpeed).reverse();
    toggleRef.current?.focus();
  }, [open, onClose, toggleRef]);

  // Tab circula só dentro do menu.
  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !rootRef.current) return;
    const focusable = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={nav.menu}
      className={styles.menu}
      onKeyDown={trapFocus}
      // Fechado (ou fechando): fora do foco e dos cliques.
      inert={!open}
    >
      <div className={styles.top}>
        <LogoRD className={styles.logo} />
        <button ref={closeRef} type="button" className={styles.close} aria-label={nav.closeMenu} onClick={onClose}>
          <X size={28} strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <nav aria-label={nav.main}>
        <ul className={styles.links}>
          {navLinks.map((link, i) => (
            <li key={link.href} data-menu-item>
              <a className={styles.link} href={link.href} onClick={onClose}>
                <span className={styles.number} aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.label}>{nav[link.key]}</span>
                <span className={styles.arrow} aria-hidden>
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer} data-menu-item>
        <div className={styles.language}>
          <span className={styles.languageLabel} aria-hidden>
            {nav.language}
          </span>
          <LanguageChoice className={styles.languageChoice} />
        </div>
        <ul className={styles.socials} aria-label={social.list}>
          {MENU_SOCIALS.map((socialId) => {
            const link = socialLinks.find((item) => item.id === socialId);
            if (!link) return null;
            return (
              <li key={socialId}>
                <a
                  className={styles.social}
                  href={socialId === "whatsapp" ? whatsappUrl(contact.whatsappMessage) : link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.open} ${link.label}`}
                >
                  <Image src={link.icon.src} alt="" width={link.icon.width} height={link.icon.height} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
