import en from "./messages/en.json";
import ptBR from "./messages/pt-BR.json";
import type { Locale } from "./config";

/** Formato das traduções: o de pt-BR é a referência. */
export type Messages = typeof ptBR;

/** As duas versões (o inglês precisa ter exatamente as mesmas chaves). */
export const MESSAGES: Record<Locale, Messages> = { "pt-BR": ptBR, en: en satisfies Messages };
