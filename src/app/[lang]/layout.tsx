import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/I18nProvider";
import { DEFAULT_LOCALE, hasLocale, LOCALE_PATH, LOCALES } from "@/i18n/config";
import { MESSAGES } from "@/i18n/messages";
import { INTRO_HEAD_SCRIPT } from "@/lib/animations/heroIntro";
import "../globals.css";

// Fontes identificadas no Figma: Inter (Regular/Medium/SemiBold/Bold),
// JetBrains Mono (Bold, título do Hero) e Manrope (SemiBold/Bold/ExtraBold:
// headlines, números da seção Sobre e CTA do Contato).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

/** Uma página estática por idioma: "/" (pt-BR, via proxy.ts) e "/en". */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { title, description } = MESSAGES[lang].meta;
  return {
    title,
    description,
    alternates: {
      canonical: LOCALE_PATH[lang],
      languages: {
        "pt-BR": LOCALE_PATH["pt-BR"],
        en: LOCALE_PATH.en,
        "x-default": LOCALE_PATH[DEFAULT_LOCALE],
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: lang === "en" ? "en_US" : "pt_BR",
      alternateLocale: lang === "en" ? "pt_BR" : "en_US",
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${jetbrainsMono.variable} ${manrope.variable} antialiased`}
      // O script abaixo põe a classe da entrada do Hero antes da hidratação.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
      </head>
      <body>
        <I18nProvider initialLocale={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
