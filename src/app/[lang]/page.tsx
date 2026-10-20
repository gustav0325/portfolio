import AboutSection from "@/components/about/AboutSection";
import ContactSection from "@/components/contact/ContactSection";
import Hero from "@/components/hero/Hero";
import InteractionLayer from "@/components/interactions/InteractionLayer";
import Navbar from "@/components/layout/Navbar";
import ProjectsSection from "@/components/projects/ProjectsSection";

export default function Home() {
  return (
    <>
      {/* Navbar única e fixa; o tema acompanha a seção sob ela (data-nav-theme). */}
      <Navbar />
      <main>
        <Hero />
        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </main>
      {/* Hovers (só com mouse) e feedback de clique (também no toque). */}
      <InteractionLayer />
    </>
  );
}
