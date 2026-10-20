"use client";

import Image from "next/image";
import { useMessages } from "@/i18n/I18nProvider";
import {
  ACTIVE_SIZE,
  CENTER_X,
  IDLE_SIZE,
  indicatorFill,
  indicatorTrack,
  px,
  SLOT_CENTERS,
} from "./indicatorGeometry";
import styles from "./projects.module.css";

type ProjectIndicatorProps = {
  ids: string[];
  /** Índice do projeto em destaque no estado estático (0, 1, 2). */
  activeIndex: number;
};

/**
 * Indicador lateral 01/02/03. O estado inicial vem das props; na animação,
 * o scroll atualiza `data-active` de cada item, a geometria dos trilhos
 * (data-indicator-track) e o scaleY de cada trecho preenchido
 * (data-indicator-progress). Cada item tem as duas bolinhas (ativa e
 * inativa) para a troca ser uma transição suave.
 */
export default function ProjectIndicator({ ids, activeIndex }: ProjectIndicatorProps) {
  const { projects } = useMessages();
  return (
    <ol className={styles.indicator} aria-label={projects.indicator} data-indicator>
      {ids.map((id, i) => {
        const active = i === activeIndex;
        const center = SLOT_CENTERS[i];
        const hasTrack = i + 1 < ids.length;
        const track = hasTrack ? indicatorTrack(i, activeIndex) : null;
        const dot = (size: number) => ({
          left: px(CENTER_X - size / 2),
          top: px(center - size / 2),
          width: px(size),
          height: px(size),
        });

        return (
          <li
            key={id}
            data-active={active}
            aria-current={active ? "step" : undefined}
            data-indicator-item
          >
            <Image
              src="/projects/ui/dot.svg"
              alt=""
              width={IDLE_SIZE}
              height={IDLE_SIZE}
              className={`${styles.dot} ${styles.dotIdle}`}
              style={dot(IDLE_SIZE)}
            />
            <Image
              src="/projects/ui/dot-active.svg"
              alt=""
              width={ACTIVE_SIZE}
              height={ACTIVE_SIZE}
              className={`${styles.dot} ${styles.dotActive}`}
              style={dot(ACTIVE_SIZE)}
            />
            <span className={styles.number} style={{ top: px(center - ACTIVE_SIZE / 2) }}>
              {id}
            </span>
            {track && (
              <>
                <span
                  className={styles.track}
                  style={{ top: px(track.top), height: px(track.height) }}
                  data-indicator-track
                  aria-hidden
                />
                <span
                  className={styles.progress}
                  style={{
                    top: px(track.top),
                    height: px(track.height),
                    transform: `scaleY(${indicatorFill(i, activeIndex)})`,
                  }}
                  data-indicator-track
                  data-indicator-progress
                  aria-hidden
                />
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
