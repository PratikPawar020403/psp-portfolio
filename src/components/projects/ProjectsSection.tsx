
import { useState } from 'react';
import { ProjectFilters } from './ProjectFilters';
import { ProjectGrid } from './ProjectGrid';
import { projects } from '@/data/projects';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

const ProjectsSection = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [expandedProject, setExpandedProject] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);
    const categories = ["All", "Deep Learning", "Machine Learning", "Web Development", "Cybersecurity"];

    // Filter projects based on selected category
    const filteredProjects = projects.filter(project =>
        selectedCategory === "All" || project.category === selectedCategory
    );

    // Determine which projects to display based on the showAll state
    const displayedProjects = selectedCategory === "All" && !showAll
        ? filteredProjects.slice(0, 4)
        : filteredProjects;

    // Check if we need to show the "View More" button
    const shouldShowViewMore = selectedCategory === "All" &&
        filteredProjects.length > 4 &&
        !showAll;

    const handleProjectClick = (projectId: number) => {
        setExpandedProject(expandedProject === projectId ? null : projectId);
    };

    return (
        <div className="min-h-screen px-4 py-8 md:py-16 bg-gradient-to-b from-[#0A1A2E] via-[#000000] to-[#000000] font-nunito">
            <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
                <div className="text-center space-y-4 md:space-y-6">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                        My Projects
                    </h2>
                    <p className="text-xl md:text-2xl text-[#00FFFF] mb-2 md:mb-4">
                        "Dream it. Build it. Ship it."
                    </p>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                        Showcasing data-driven projects that transform insights into interactive experiences.
                    </p>
                </div>

                <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 md:p-6 mx-4 md:mx-0">
                    <ProjectFilters
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />
                </div>

                <ProjectGrid
                    projects={displayedProjects}
                    expandedProject={expandedProject}
                    onProjectClick={handleProjectClick}
                />

                {shouldShowViewMore && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mt-8"
                    >
                        <Button
                            onClick={() => setShowAll(true)}
                            className="bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] text-white text-lg px-8 py-6 h-auto hover:opacity-90 transition-all"
                        >
                            View More Projects
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProjectsSection;
