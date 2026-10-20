/*
 * Idiomas do site. Português é o padrão (sem preferência salva). Cada idioma
 * tem a sua URL — "/" (pt-BR) e "/en" —, pré-renderizada como página
 * estática; o cookie guarda a escolha para as próximas visitas (proxy.ts).
 */
export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";

/** Cookie com a preferência (lido pelo proxy ao abrir "/"). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Sigla mostrada no seletor. */
export const LOCALE_SHORT: Record<Locale, string> = { "pt-BR": "PT", en: "EN" };

/** URL pública de cada idioma. */
export const LOCALE_PATH: Record<Locale, string> = { "pt-BR": "/", en: "/en" };

export const hasLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);
