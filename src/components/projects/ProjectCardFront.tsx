import { Project } from '@/types/project';
import { ArrowLeftRight } from 'lucide-react';

interface ProjectCardFrontProps {
  project: Project;
}

export const ProjectCardFront = ({ project }: ProjectCardFrontProps) => {
  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-gradient-to-br from-[#2D1B69] to-[#6B4BFF]">
      {/* Project Image */}
      <img
        src={project.image}
        alt={`${project.title} project preview`}
        className="w-full h-full object-cover object-center opacity-90 transition-transform duration-300 hover:scale-105"
        loading="lazy"
        width="800"
        height="600"
        decoding="async"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space-grotesk mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
          {project.title}
        </h3>

        <p className="text-base sm:text-lg md:text-xl text-gray-200 font-inter mb-4 sm:mb-6 line-clamp-3 tracking-wide leading-relaxed">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 sm:px-4 py-1 sm:py-2 bg-white/10 rounded-full text-xs sm:text-sm backdrop-blur-sm font-inter tracking-wider uppercase text-cyan-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Flip Indicator */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-white/70 animate-pulse">
        <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
  );
};