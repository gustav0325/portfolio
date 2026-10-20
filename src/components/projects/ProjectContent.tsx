"use client";

import type { Project } from "@/data/projects";
import { useMessages } from "@/i18n/I18nProvider";
import AnimatedProjectLink from "./AnimatedProjectLink";
import styles from "./projects.module.css";

/**
 * Informações do projeto (node 35:214): título com a seta (link para o site,
 * AnimatedProjectLink), descrição e tags. As tags são informativas e não
 * reagem ao mouse. Os alvos da entrada são marcados com `data-content`.
 */
export default function ProjectContent({ project }: { project: Project }) {
  const { title, slug, technologies, year, url } = project;
  const { projects } = useMessages();

  return (
    <div className={styles.info} data-slide-content>
      <h3 className={styles.title}>
        <AnimatedProjectLink title={title} url={url} />
      </h3>
      <div className={styles.details}>
        <p className={styles.description} data-content="description">
          {projects.items[slug].description}
        </p>
        <ul className={styles.tags} aria-label={projects.tags}>
          {technologies.map((tech) => (
            <li key={tech} className={styles.tag} data-content="tag">
              {tech}
            </li>
          ))}
          <li className={`${styles.tag} ${styles.year}`} data-content="tag">
            {year}
          </li>
        </ul>
      </div>
    </div>
  );
}
