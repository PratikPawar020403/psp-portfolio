import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Project } from "@/types/project";
import { ProjectCardFront } from "./ProjectCardFront";
import { ProjectCardBack } from "./ProjectCardBack";

interface ProjectCardProps {
  project: Project;
  isExpanded: boolean;
  onToggleExpand: () => void;
  index: number;
}

export const ProjectCard = ({
  project,
  isExpanded,
  onToggleExpand,
  index
}: ProjectCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't flip if clicking on button or anchor
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    onToggleExpand();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut"
        }
      }}
      viewport={{ once: true, margin: "-100px" }}
      className="perspective w-full cursor-pointer h-[500px] sm:h-[600px]"
      onClick={handleCardClick}
    >
      <Card
        className={`
          relative w-full h-full transition-all duration-500 transform-gpu
          ${isExpanded ? 'rotate-y-180' : ''}
          hover:shadow-xl
        `}
        style={{ 
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden">
          <ProjectCardFront project={project} />
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden">
          <ProjectCardBack project={project} />
        </div>
      </Card>
    </motion.div>
  );
};