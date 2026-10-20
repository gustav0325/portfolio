/** Recorte de uma imagem dentro da sua caixa, em % (preenchimento "crop" do Figma). */
export type Crop = { left: number; top: number; width: number; height: number };

/**
 * Um projeto. Os textos traduzíveis (descrição e texto alternativo da imagem)
 * ficam em src/i18n/messages, em projects.items[slug]; o título é nome
 * próprio e não muda de idioma.
 */
export type Project = {
  id: "01" | "02" | "03";
  slug: "gvt" | "lumi" | "vincent";
  title: string;
  /** Print do site (o mesmo arquivo serve de fundo escurecido e de tela). */
  image: { src: string; width: number; height: number };
  /**
   * Recorte do fundo escurecido quando o Figma não usa "cover" simples
   * (GVT, node 23:23). Sem valor, o fundo cobre a área (object-fit: cover).
   */
  backdropCrop?: Crop;
  technologies: string[];
  year: string;
  /** Site publicado do projeto: título + seta ↗ viram o link (nova aba). */
  url?: string;
};

// Conteúdo dos frames 13:11 (GVT), 35:244 (Lumi) e 35:273 (Vincent) do Figma.
export const projects: Project[] = [
  {
    id: "01",
    slug: "gvt",
    title: "GVT CORTES E FUROS",
    image: {
      src: "/projects/gvt/cover.png",
      width: 1352,
      height: 616,
    },
    backdropCrop: { left: -21.26, top: 0.07, width: 142.56, height: 116.8 },
    technologies: ["FIGMA", "JS"],
    year: "2026",
    url: "https://gvtcortesefuros.com.br",
  },
  {
    id: "02",
    slug: "lumi",
    title: "LUMI STUDIO",
    image: {
      src: "/projects/lumi/cover.png",
      width: 1352,
      height: 616,
    },
    technologies: ["FIGMA", "REACT"],
    year: "2026",
    url: "https://lumi-studio-one.vercel.app/",
  },
  {
    id: "03",
    slug: "vincent",
    title: "VINCENT ADVOGADO",
    image: {
      src: "/projects/vincent/cover.png",
      width: 1352,
      height: 616,
    },
    technologies: ["HTML", "JS"],
    year: "2026",
    url: "https://advocacia-henna.vercel.app/",
  },
];
