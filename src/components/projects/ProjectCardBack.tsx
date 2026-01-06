import { Button } from '../ui/button';
import { Github, ExternalLink } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectCardBackProps {
  project: Project;
}

export const ProjectCardBack = ({ project }: ProjectCardBackProps) => {
  // Parse features from details
  const features = project.details
    .split('Key Features:')[1]
    ?.split('Learnings:')[0]
    ?.split('•')
    ?.filter(feature => feature.trim().length > 0)
    ?.map(feature => feature.trim()) || [];

  // Parse learnings from details
  const learnings = project.details.split('Learnings:')[1]?.trim() || '';


  return (
    <div className="h-full p-6 sm:p-8 bg-gradient-to-br from-[#2D1B69] to-[#6B4BFF] rounded-lg flex flex-col justify-between">
      {/* Content */}
      <div className="flex-1 space-y-4 sm:space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 text-white font-space-grotesk">
          {project.title}
        </h3>

        {/* Key Features */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white/10 rounded-lg p-3 sm:p-4">
            <h4 className="text-base sm:text-lg font-semibold text-purple-200 mb-2 font-inter">
              Key Features
            </h4>
            <ul className="list-disc list-inside text-gray-200 space-y-1.5 sm:space-y-2 font-inter">
              {features.map((feature, index) => (
                <li key={index} className="text-xs sm:text-sm">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Learnings */}
          <div className="bg-white/10 rounded-lg p-3 sm:p-4">
            <h4 className="text-base sm:text-lg font-semibold text-purple-200 mb-2 font-inter">
              Learnings
            </h4>
            <p className="text-xs sm:text-sm text-gray-200 font-inter">
              {learnings}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex gap-3 sm:gap-4 mt-4 sm:mt-6"
        onClick={(e) => e.stopPropagation()}
      >
        {project.githubUrl && (
          <Button
            asChild
            variant="outline"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 font-inter text-xs sm:text-sm"
          >
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              View Code
            </a>
          </Button>
        )}

        {project.demoUrl && (
          <Button
            asChild
            variant="default"
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white gap-2 font-inter text-xs sm:text-sm"
          >
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              Live Demo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};