"use client";

import Image from "next/image";
import { useMessages } from "@/i18n/I18nProvider";
import styles from "./projects.module.css";

/**
 * Cabeçalho da seção (node 24:31). Cada linha do título é uma máscara para a
 * entrada; os alvos da animação são marcados com `data-reveal`.
 */
export default function ProjectsHeader() {
  const { projects } = useMessages();
  return (
    <header className={styles.header}>
      <div className={styles.headingGroup}>
        <p className={styles.index} data-reveal="index">
          01
          <Image src="/projects/ui/line-index.svg" alt="" width={126} height={1} />
        </p>
        <h2 id="projetos-titulo" className={styles.heading}>
          <span className={styles.headingLine}>
            <span className={styles.headingText} data-reveal="heading">
              {projects.headingLine1}
            </span>
          </span>{" "}
          <span className={styles.headingLine}>
            <span className={styles.headingText} data-reveal="heading">
              {projects.headingLine2}
            </span>
          </span>
        </h2>
      </div>
      <p className={styles.lead} data-reveal="lead">
        {projects.lead}
      </p>
    </header>
  );
}
