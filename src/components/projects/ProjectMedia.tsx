"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import ProjectSpotlight from "@/components/interactions/ProjectSpotlight";
import type { Project } from "@/data/projects";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./projects.module.css";

const MEDIA_SIZES = "(min-width: 1024px) 82vw, 100vw";

/**
 * Mídia do projeto (node 26:38): fundo ampliado e escurecido + tela com o
 * print. Ela sobe junto com a coluna de projetos; só a entrada do card 01
 * a anima à parte (data-slide-media). A mídia é escura: com ela atrás, a
 * navbar usa o vidro escuro.
 */
export default function ProjectMedia({ project }: { project: Project }) {
  const { image, backdropCrop, slug } = project;
  const { projects } = useMessages();

  return (
    <div className={styles.media} data-slide-media data-nav-theme="dark-glass">
      {/* Fundo: o próprio print, ampliado e escurecido (nodes 23:23 e 26:40). */}
      <div
        className={styles.backdrop}
        style={
          backdropCrop && {
            left: `${backdropCrop.left}%`,
            top: `${backdropCrop.top}%`,
            width: `${backdropCrop.width}%`,
            height: `${backdropCrop.height}%`,
          }
        }
        aria-hidden
      >
        <Image
          src={image.src}
          alt=""
          fill
          sizes={MEDIA_SIZES}
          quality={90}
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.shade} aria-hidden />
      {/*
        Tela com cantos arredondados (node 26:39). Hover (hoverEngine.ts):
        reflexo radial que segue o cursor e zoom discreto numa camada interna
        própria — a coluna e o card, que o scroll move, não são tocados.
      */}
      <div className={styles.screen} data-hover data-spotlight>
        <ProjectSpotlight>
          <div
            className={styles.shot}
            style={{ "--shot-ratio": image.height / image.width } as CSSProperties}
          >
            <Image
              src={image.src}
              alt={projects.items[slug].imageAlt}
              fill
              sizes={MEDIA_SIZES}
              quality={90}
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        </ProjectSpotlight>
      </div>
    </div>
  );
}
