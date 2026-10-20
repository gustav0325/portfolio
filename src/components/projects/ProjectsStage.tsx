import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectIndicator from "./ProjectIndicator";
import styles from "./projects.module.css";

/** Projeto em destaque no estado estático (frame 13:11). */
const FIRST_ACTIVE = 0;

/**
 * Palco dos projetos (node 35:243):
 *   .pinSpacer   espaço de scroll reservado para o pin (altura calculada)
 *   .pinStage    o que fica preso: uma tela de altura, com o indicador fixo
 *   .window      a janela onde a coluna aparece
 *   .column      a coluna com os três projetos, que sobe (translateY)
 */
export default function ProjectsStage() {
  return (
    <div className={styles.pinSpacer} data-projects-spacer>
      <div className={styles.pinStage} data-projects-stage>
        <div className={styles.window} data-projects-window>
          <div className={styles.column} data-projects-column>
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
        <ProjectIndicator ids={projects.map((p) => p.id)} activeIndex={FIRST_ACTIVE} />
      </div>
    </div>
  );
}
