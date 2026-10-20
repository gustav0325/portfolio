"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LOCALE_COOKIE, LOCALE_PATH, type Locale } from "./config";
import { MESSAGES, type Messages } from "./messages";

type I18n = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18n | null>(null);

/**
 * Idioma da página. O servidor renderiza já no idioma da URL ("/" ou "/en"),
 * então não há texto em outro idioma antes da hidratação. Trocar pelo seletor
 * muda o texto no lugar — sem navegação nem reload, sem remontar seções (o
 * pin, os loops e o que já foi revelado continuam como estão) — e acerta a
 * URL, o cookie, o <html lang>, o título e a descrição.
 */
export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const messages = MESSAGES[locale];
  const rendered = useRef(locale);

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocaleState(next);
  }, []);

  // Depois que o novo texto está no DOM (e as seções refizeram o que mede
  // texto, nos efeitos delas, que rodam antes deste), antes de pintar.
  useLayoutEffect(() => {
    if (rendered.current === locale) return;
    rendered.current = locale;
    document.documentElement.lang = locale;
    document.title = messages.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", messages.meta.description);
    // Mesma página, outra URL: o refresh abre direto neste idioma. Mantém o
    // estado do router e a âncora atual.
    const url = LOCALE_PATH[locale] + location.search + location.hash;
    window.history.replaceState(window.history.state, "", url);
    // As alturas dos textos mudaram: posições do ScrollTrigger recalculadas.
    ScrollTrigger.refresh();
  }, [locale, messages]);

  const value = useMemo(() => ({ locale, messages, setLocale }), [locale, messages, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n precisa do <I18nProvider>.");
  return context;
}

/** Atalho para os textos do idioma atual. */
export const useMessages = () => useI18n().messages;
