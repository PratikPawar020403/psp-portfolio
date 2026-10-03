import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { motion } from 'framer-motion';

interface ProjectGridProps {
  projects: Project[];
  expandedProject: number | null;
  onProjectClick: (id: number) => void;
}

export const ProjectGrid = ({ projects, expandedProject, onProjectClick }: ProjectGridProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-[1400px] mx-auto px-4 sm:px-6"
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          isExpanded={expandedProject === project.id}
          onToggleExpand={() => onProjectClick(project.id)}
          index={index}
        />
      ))}
    </motion.div>
  );
};