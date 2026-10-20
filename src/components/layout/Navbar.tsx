"use client";

import { Menu } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { navLinks } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import LogoRD from "./LogoRD";
import MobileMenu from "./MobileMenu";
import styles from "./navbar.module.css";
import { useActiveIndicator, type IndicatorLine } from "./useActiveIndicator";
import { useHoverPill } from "./useHoverPill";

/**
 * Tema da navbar conforme o fundo sob ela, declarado com `data-nav-theme`
 * nas seções e em áreas internas (a mídia escura dos cards de Projetos):
 *   "dark"       → Hero: vidro claro e transparente, logo e textos brancos.
 *   "light"      → fundo claro (Projetos, Contato): vidro leitoso, textos pretos.
 *   "dark-glass" → fundo escuro (cards de Projetos, Sobre): vidro escuro
 *                  translúcido, textos brancos — sem o cinza do vidro claro.
 * Sem o atributo, "dark".
 */
export type NavTheme = "dark" | "light" | "dark-glass";

const NAV_THEMES: readonly string[] = ["dark", "light", "dark-glass"];

/**
 * Faixas horizontais da tela usadas para detectar o que está atrás:
 * - THEME_BAND (7%–8% da altura, atrás dos links): o elemento com
 *   `data-nav-theme` atrás da navbar define a cor, para ela continuar
 *   legível sobre o fundo (o mais interno/posterior vence).
 * - ACTIVE_BAND (16%–17%, logo abaixo da navbar): a seção cujo conteúdo está
 *   em vista define o link ativo — inclusive ao clicar num link do menu, que
 *   para a seção logo abaixo da navbar (scroll-padding-top em globals.css).
 */
const THEME_BAND = "-7% 0px -92% 0px";
const ACTIVE_BAND = "-16% 0px -83% 0px";

/**
 * Linha sob o link da seção atual, como desenhada em cada frame do Figma:
 * deslocamento e largura (px do Figma, com o texto em 20px — aplicados em em,
 * proporcionais ao texto atual) e o lado para onde o degradê some. A cor é a
 * do tema (branca no escuro, preta no claro). Um único indicador desliza
 * entre os links (useActiveIndicator.ts). Em inglês as palavras são outras:
 * a largura acompanha a do texto, com as mesmas margens do Figma.
 */
const ACTIVE_LINES: Record<Locale, Record<string, IndicatorLine>> = {
  "pt-BR": {
    "#projetos": { left: 1, width: 77, fade: "right" }, // node 42:306
    "#sobre": { left: 2, width: 53, fade: "right" }, // node 42:307
    "#contato": { left: 2, width: 72, fade: "left" }, // node 42:308
  },
  en: {
    "#projetos": { left: 2, width: "auto", fade: "right" },
    "#sobre": { left: 2, width: "auto", fade: "right" },
    "#contato": { left: 2, width: "auto", fade: "left" },
  },
};

/**
 * Navbar única e global, fixa no topo da tela. Muda de tema e de link ativo
 * conforme a seção sob ela (apenas uma transição curta de cor). Abaixo de
 * 1024px vira menu hambúrguer.
 */
export default function Navbar() {
  const { locale, messages } = useI18n();
  const { nav } = messages;
  const [open, setOpen] = useState(false);
  // A navbar fixa recebe o menu de idiomas (portal fora da barra de vidro).
  const [shell, setShell] = useState<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [activeHref, setActiveHref] = useState<string>();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLLIElement>(null);
  const pillRef = useRef<HTMLLIElement>(null);
  useActiveIndicator(linksRef, indicatorRef, activeHref, ACTIVE_LINES[locale]);
  useHoverPill(linksRef, pillRef);
  const menuId = useId();
  const closeMenu = useCallback(() => setOpen(false), []);
  const barClass = [
    styles.bar,
    theme === "light" && styles.light,
    theme === "dark-glass" && styles.darkGlass,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    // Seções com id dentro do <main> (o Hero fica dentro do trecho de scroll)
    // e, para o tema, também as áreas internas que declaram o próprio fundo.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const themed = Array.from(document.querySelectorAll<HTMLElement>("main [data-nav-theme]"));
    const watch = (
      rootMargin: string,
      targets: HTMLElement[],
      onTarget: (target: HTMLElement) => void,
    ) => {
      // Guarda quais elementos estão na faixa; quando se sobrepõem (a seção
      // branca sobe por cima do Hero, a mídia dentro da seção), vale o que vem
      // depois no documento — o mais interno ou o que está por cima.
      const inBand = new Set<Element>();
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) =>
            entry.isIntersecting ? inBand.add(entry.target) : inBand.delete(entry.target),
          );
          const current = targets.findLast((target) => inBand.has(target));
          if (current) onTarget(current);
        },
        { rootMargin },
      );
      targets.forEach((target) => observer.observe(target));
      return observer;
    };

    const themeObserver = watch(THEME_BAND, themed, (target) => {
      const value = target.dataset.navTheme ?? "dark";
      setTheme((NAV_THEMES.includes(value) ? value : "dark") as NavTheme);
    });
    const activeObserver = watch(ACTIVE_BAND, sections, (section) => {
      const href = `#${section.id}`;
      setActiveHref(navLinks.some((link) => link.href === href) ? href : undefined);
    });
    return () => {
      themeObserver.disconnect();
      activeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={setShell} className={styles.shell} data-theme={theme}>
      <header
        className={barClass}
        data-intro="navbar"
      >
        <a className={styles.logoLink} href="#inicio" aria-label={nav.home}>
          <LogoRD className={styles.logo} />
        </a>

        <nav className={styles.main} aria-label={nav.main}>
          <ul ref={linksRef} className={styles.links}>
            {/* Pílula de hover (só o hover; a seção ativa é o indicador abaixo). */}
            <li ref={pillRef} className={styles.pill} aria-hidden />
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  className={styles.link}
                  href={link.href}
                  aria-current={link.href === activeHref ? "location" : undefined}
                >
                  {nav[link.key]}
                </a>
              </li>
            ))}
            {/* Indicador único da seção ativa: desliza até o link ativo. */}
            <li ref={indicatorRef} className={styles.indicator} aria-hidden>
              <span className={styles.indicatorFade} data-fade="right" />
              <span className={styles.indicatorFade} data-fade="left" />
            </li>
          </ul>
          <LanguageSwitcher className={styles.lang} container={shell} />
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={styles.menuButton}
          aria-label={nav.openMenu}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(true)}
        >
          <Menu size={24} strokeWidth={1.75} aria-hidden />
        </button>
      </header>

      {/* Menu em tela cheia do celular: acima da barra, dentro da navbar fixa. */}
      <MobileMenu id={menuId} open={open} onClose={closeMenu} toggleRef={toggleRef} />
    </div>
  );
}
