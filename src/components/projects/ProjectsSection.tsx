import ProjectsHeader from "./ProjectsHeader";
import ProjectsScene from "./ProjectsScene";
import ProjectsStage from "./ProjectsStage";

/**
 * Seção Projetos (frame 13:11). Animação em src/lib/animations/projectsMotion.ts
 * (valores em projectsConfig.ts).
 */
export default function ProjectsSection() {
  return (
    <ProjectsScene>
      <ProjectsHeader />
      <ProjectsStage />
    </ProjectsScene>
  );
}
