import Image from "next/image";
import type { HeroPlane } from "@/lib/animations/heroParallax";
import styles from "./hero.module.css";

type Rect = { left: number; top: number; width: number; height: number };

export type HeroLayerId =
  | "sky"
  | "farClouds"
  | "midClouds"
  | "buildings"
  | "foreground";

type HeroLayer = {
  id: HeroLayerId;
  /** Plano de profundidade que o parallax move (SPEEDS em heroParallax.ts). */
  plane: HeroPlane;
  src: string;
  zIndex: number;
  opacity?: number;
  /** Caixa da camada no frame 1440×1175, em %. */
  box: Rect;
  /** Recorte da imagem dentro da caixa, em % (preenchimento "crop" do Figma). */
  crop: Rect;
  sizes: string;
};

const FRAME_H = 1175;
const pct = (px: number) => (px / FRAME_H) * 100;
const full: Rect = { left: 0, top: 0, width: 100, height: 100 };

// Largura renderizada de cada imagem (ver hero.module.css): no mobile o frame
// cobre a tela pela altura (~123vh de largura); no desktop, céu e nuvens cobrem
// a largura da tela e o prédio segue a escala da composição (~132vh).
const MOBILE = "(max-width: 767px)";

/**
 * Camadas do frame "Hero" (nodes 9:48, 9:36, 9:51, 10:60), de trás para frente,
 * mais o foreground: as mesmas nuvens centrais, espelhadas e maiores (mais
 * perto da câmera), logo abaixo da tela em repouso — só entram com o scroll.
 */
const LAYERS: Record<HeroLayerId, HeroLayer> = {
  sky: {
    id: "sky",
    plane: "sky",
    src: "/hero/ceu.png",
    zIndex: 0,
    box: full,
    crop: { left: 0, top: -40.53, width: 100, height: 140.55 },
    sizes: `${MOBILE} 123vh, 100vw`,
  },
  farClouds: {
    id: "farClouds",
    plane: "distantCloud",
    src: "/hero/nuvem-distante.png",
    zIndex: 10,
    opacity: 0.6,
    box: { left: 0, top: 0, width: 100, height: pct(698) },
    crop: { left: -0.02, top: -46.85, width: 100.04, height: 146.85 },
    sizes: `${MOBILE} 123vh, 100vw`,
  },
  midClouds: {
    id: "midClouds",
    plane: "mainScene",
    src: "/hero/nuvem-central.png",
    zIndex: 20,
    box: full,
    crop: { left: -0.02, top: -8.34, width: 133.52, height: 116.43 },
    sizes: `${MOBILE} 164vh, 134vw`,
  },
  buildings: {
    id: "buildings",
    plane: "mainScene",
    src: "/hero/predio.png",
    zIndex: 40,
    box: { left: 0, top: pct(162), width: 100, height: pct(1013) },
    crop: { left: -3.68, top: 0, width: 107.36, height: 124.58 },
    sizes: `${MOBILE} 132vh, 132vh`,
  },
  foreground: {
    id: "foreground",
    plane: "foreground",
    src: "/hero/nuvem-central.png",
    zIndex: 45,
    box: full,
    crop: full,
    // Mesmo `sizes` das nuvens centrais: o navegador reaproveita o arquivo.
    sizes: `${MOBILE} 164vh, 134vw`,
  },
};

const toStyle = ({ left, top, width, height }: Rect) => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${width}%`,
  height: `${height}%`,
});

// Alvos da entrada (heroIntro.ts): elementos internos ao plano que o
// parallax move, para não disputarem o mesmo transform.
const INTRO_TARGET: Partial<Record<HeroPlane, "box" | "crop">> = {
  mainScene: "box",
  sky: "crop",
  distantCloud: "crop",
};

function ArtLayer({ layer }: { layer: HeroLayer }) {
  const intro = INTRO_TARGET[layer.plane];
  return (
    <div
      className={`${styles.plane} ${styles[layer.id]}`}
      style={{ zIndex: layer.zIndex }}
      data-plane={layer.plane}
      aria-hidden
    >
      <div
        className={styles.box}
        style={{ ...toStyle(layer.box), opacity: layer.opacity }}
        data-intro={intro === "box" ? "scene" : undefined}
      >
        <div
          className={styles.crop}
          style={toStyle(layer.crop)}
          data-intro={intro === "crop" ? "backdrop" : undefined}
        >
          <Image
            src={layer.src}
            alt=""
            fill
            sizes={layer.sizes}
            quality={90}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Canvas da cena: o frame 1440×1175 do Figma com as camadas independentes.
 * O título fica fora do canvas, com z-index entre as nuvens centrais (20) e o
 * prédio (40), para que os prédios o encubram de verdade. Prédio e nuvens
 * centrais formam a cena principal: recebem o mesmo deslocamento (sem
 * wrapper, que criaria um contexto de empilhamento e tiraria o título do meio).
 */
export default function HeroLayers() {
  return (
    <div className={styles.canvas}>
      <ArtLayer layer={LAYERS.sky} />
      <ArtLayer layer={LAYERS.farClouds} />
      <ArtLayer layer={LAYERS.midClouds} />
      <ArtLayer layer={LAYERS.buildings} />
      <ArtLayer layer={LAYERS.foreground} />
    </div>
  );
}
