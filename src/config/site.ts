/** Link da navbar; o texto vem das traduções (messages → nav[key]). */
export type NavLink = {
  key: "projects" | "about" | "contact";
  href: `#${string}`;
};

export const navLinks: NavLink[] = [
  { key: "projects", href: "#projetos" },
  { key: "about", href: "#sobre" },
  { key: "contact", href: "#contato" },
];

/** E-mail de contato (frame Contato, node 33:16). */
export const contactEmail = "gurdesign@gmail.com";

/**
 * Endereços oficiais das redes — os únicos lugares com essas URLs no projeto
 * (ícones do Hero e do Contato e os CTAs de conversa usam estes valores).
 */
export const SOCIAL_LINKS = {
  whatsapp: "https://wa.me/5511943977964",
  instagram: "https://www.instagram.com/ribeirodsg_/",
  github: "https://github.com/gustav0325",
  linkedin: "https://www.linkedin.com/in/gustavo-ribeiro-b154792a3",
} as const;

/**
 * Conversa no WhatsApp (+55 11 94397-7964), com uma mensagem já escrita,
 * codificada para a URL (`https://wa.me/5511943977964?text=...`).
 */
export const whatsappUrl = (message?: string) =>
  message ? `${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(message)}` : SOCIAL_LINKS.whatsapp;

export type SocialLink = {
  id: keyof typeof SOCIAL_LINKS;
  /** Nome da rede (nome próprio, igual nos dois idiomas). */
  label: string;
  href: string;
  /** Ícone exportado do Figma e suas dimensões originais. */
  icon: { src: string; width: number; height: number };
};

export const socialLinks: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    icon: { src: "/hero/instagram.svg", width: 35, height: 35 },
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: SOCIAL_LINKS.whatsapp,
    icon: { src: "/hero/whatsapp.svg", width: 34.8324, height: 35 },
  },
  {
    id: "github",
    label: "GitHub",
    href: SOCIAL_LINKS.github,
    icon: { src: "/hero/github.svg", width: 35, height: 34.1366 },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: SOCIAL_LINKS.linkedin,
    icon: { src: "/hero/linkedin.svg", width: 35, height: 35 },
  },
];
