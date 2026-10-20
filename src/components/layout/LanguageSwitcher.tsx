"use client";

import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { LOCALE_SHORT, LOCALES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./navbar.module.css";

/** Abertura do menu de idiomas (fechar é a mesma animação ao contrário). */
const MENU_MOTION = {
  duration: 0.3,
  ease: "power3.out",
  y: -8,
  itemStagger: 0.04,
  /** Fechar um pouco mais rápido que abrir. */
  closeSpeed: 1.3,
} as const;

/** Opções do menu, na ordem. */
const optionsOf = (menu: HTMLElement | null) =>
  Array.from(menu?.querySelectorAll<HTMLElement>("[role=menuitemradio]") ?? []);

/**
 * Seletor de idioma da navbar: o botão "PT ˅" do Figma abre um menu com
 * "Português — PT" e "English — EN". O menu vai num portal dentro da navbar
 * fixa (fora da barra de vidro: um vidro dentro do outro não desfocaria o
 * fundo da página) e acompanha o tema dela (data-theme).
 */
export function LanguageSwitcher({ className, container }: { className?: string; container: HTMLElement | null }) {
  const { locale, setLocale, messages } = useI18n();
  const { nav } = messages;
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const chevronRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);

  // Timeline única de abrir/fechar (criada quando o portal existe).
  useEffect(() => {
    const menu = menuRef.current;
    const chevron = chevronRef.current;
    if (!menu || !chevron) return;
    const { duration, ease, y, itemStagger } = MENU_MOTION;
    gsap.set(menu, { autoAlpha: 0, y });
    const tl = gsap
      .timeline({ paused: true, defaults: { ease } })
      .to(menu, { autoAlpha: 1, y: 0, duration }, 0)
      .fromTo(optionsOf(menu), { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: duration * 0.85, stagger: itemStagger }, 0.04)
      .to(chevron, { rotation: 180, duration }, 0);
    timeline.current = tl;
    return () => {
      tl.kill();
      gsap.set([menu, chevron, ...optionsOf(menu)], { clearProps: "all" });
      timeline.current = null;
    };
  }, [container]);

  // Abre/fecha: posiciona o menu sob o botão, toca a timeline e cuida do foco.
  useEffect(() => {
    const tl = timeline.current;
    const menu = menuRef.current;
    const button = buttonRef.current;
    if (!tl || !menu || !button || !container) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      const box = container.getBoundingClientRect();
      const bar = button.closest("header")?.getBoundingClientRect() ?? button.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(menu).getPropertyValue("--menu-gap")) || 10;
      menu.style.top = `${bar.bottom - box.top + gap}px`;
      menu.style.right = `${box.right - rect.right - parseFloat(getComputedStyle(menu).paddingRight)}px`;
      gsap.set(menu, { visibility: "visible" });
      if (reduce) tl.progress(1).pause();
      else tl.timeScale(1).play();
      const options = optionsOf(menu);
      (options.find((item) => item.getAttribute("aria-checked") === "true") ?? options[0])?.focus();
    } else if (tl.progress() > 0) {
      if (reduce) tl.progress(0).pause();
      else tl.timeScale(MENU_MOTION.closeSpeed).reverse();
    }
  }, [open, container]);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = (focusButton: boolean) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };

  const choose = (next: Locale) => {
    setLocale(next);
    close(true);
  };

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const list = optionsOf(menuRef.current);
    const index = list.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => list[(i + list.length) % list.length]?.focus();
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(list.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        aria-label={`${nav.language}: ${nav.languageName[locale]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKey}
      >
        {LOCALE_SHORT[locale]}
        <span ref={chevronRef} className={styles.langChevron}>
          <ChevronDown className={styles.langIcon} strokeWidth={2} aria-hidden />
        </span>
      </button>
      {container &&
        createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={nav.language}
            className={styles.langMenu}
            onKeyDown={onMenuKey}
          >
            {LOCALES.map((option) => (
              <li key={option} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={option === locale}
                  lang={option}
                  tabIndex={-1}
                  className={styles.langOption}
                  onClick={() => choose(option)}
                >
                  <span>{nav.languageName[option]}</span>
                  <span className={styles.langCode}>{LOCALE_SHORT[option]}</span>
                </button>
              </li>
            ))}
          </ul>,
          container,
        )}
    </>
  );
}

/** No menu mobile: as duas opções lado a lado, sem dropdown. */
export function LanguageChoice({ className }: { className?: string }) {
  const { locale, setLocale, messages } = useI18n();
  return (
    <div role="group" aria-label={messages.nav.language} className={className}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={option === locale}
          aria-label={messages.nav.languageName[option]}
          className={styles.langChoice}
          onClick={() => setLocale(option)}
        >
          {LOCALE_SHORT[option]}
        </button>
      ))}
    </div>
  );
}
