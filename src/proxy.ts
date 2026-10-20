import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "./i18n/config";

/*
 * URLs de idioma: "/" é português e "/en" é inglês (as páginas ficam em
 * app/[lang], pré-renderizadas). Ao abrir "/", quem escolheu inglês antes
 * (cookie) vai para "/en"; os demais veem português. "/pt-BR" é só o nome
 * interno da rota: quem digitar vai para "/".
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    if (request.cookies.get(LOCALE_COOKIE)?.value === "en") {
      return NextResponse.redirect(new URL("/en", request.url));
    }
    return NextResponse.rewrite(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  if (pathname === `/${DEFAULT_LOCALE}`) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/", "/pt-BR"],
};
