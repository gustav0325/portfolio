import type { Project } from "@/data/projects";
import ProjectContent from "./ProjectContent";
import ProjectMedia from "./ProjectMedia";
import styles from "./projects.module.css";

type ProjectCardProps = {
  project: Project;
  index: number;
};

/** Um projeto da coluna: imagem + informações, um bloco vertical completo. */
export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <article className={styles.card} data-project={project.slug} data-slide={index}>
      <ProjectMedia project={project} />
      <ProjectContent project={project} />
    </article>
  );
}
