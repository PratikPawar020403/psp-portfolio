
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import { Project } from '@/types/project';
import { projects as fallbackProjects } from '@/data/projects';
import { fetchProjects } from '@/utils/supabaseData';

const BG = "#101010";
const INK = "#F5F3EE";
const MUTED = "#8A8A86";
const LINE = "#232323";
const ACCENT = "#39FF7A";

const CATEGORY_COLORS: Record<string, string> = {
  "Machine Learning": "#6EE7B7",
  "Deep Learning": "#6EE7B7",
  "Applied AI": "#C4B5FD",
  "Cybersecurity": "#FCA5A5",
  "Web Development": "#93C5FD",
  "Industry Experience": "#FDE68A",
  "Software Engineering": "#A7F3D0",
};
const DEFAULT_COLOR = "#6EE7B7";

/**
 * Normalizes category strings to ensure consistent casing, whitespace trimming,
 * and canonical aliases before filtering and deduplicating.
 */
function normalizeCategory(raw?: string): string {
  if (!raw) return "General";
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "applied ai") return "Applied AI";
  if (lower === "machine learning") return "Machine Learning";
  if (lower === "deep learning") return "Deep Learning";
  if (lower === "web development" || lower === "web dev") return "Web Development";
  if (lower === "cybersecurity" || lower === "cyber security") return "Cybersecurity";
  if (lower === "industry experience" || lower === "internship") return "Industry Experience";
  if (lower === "software engineering") return "Software Engineering";
  return trimmed.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function getProjectColor(category?: string): string {
  const norm = normalizeCategory(category);
  return CATEGORY_COLORS[norm] || DEFAULT_COLOR;
}

function getProjectYear(project: Project): string {
  const text = `${project.title} ${project.description} ${project.details || ''}`;
  const match = text.match(/\b(202[0-9])\b/);
  return match ? match[1] : "2025";
}

function getProjectStatus(project: Project): string {
  const text = `${project.title} ${project.category} ${project.description} ${project.details || ''}`.toLowerCase();
  if (text.includes('intern')) return 'Internship';
  if (text.includes('research') || text.includes('paper') || text.includes('submitted')) return 'Research';
  if (text.includes('ongoing') || text.includes('in progress') || text.includes('wip')) return 'Ongoing';
  return 'Shipped';
}

interface ParsedDetails {
  featuresTitle: string;
  features: string[];
  learnings: string | null;
}

/**
 * Robust case-insensitive parsing of project.details.
 * Requires colon or bullet/newline delimiter on headings to prevent false matches
 * (e.g. matching "learning" inside "deep learning models").
 */
function parseProjectDetails(project: Project): ParsedDetails {
  const details = (project.details || '').trim();
  if (!details) {
    return { featuresTitle: 'Key features', features: [], learnings: null };
  }

  // Heading regex requiring colon to ensure it's a section header, not body text
  const respMatch = details.match(/(?:key\s+)?responsibilities\s*:/i);
  const featMatch = details.match(/(?:key\s+)?(?:features|highlights|deliverables)\s*:/i);
  const learnMatch = details.match(/(?:what\s+it\s+taught\s+me|learnings?|takeaways?|outcomes?)\s*:/i);

  const isResp = !!respMatch && (!featMatch || (respMatch.index ?? 0) <= (featMatch.index ?? 0));
  const featuresTitle = isResp ? 'Key responsibilities' : 'Key features';

  let features: string[] = [];
  let learnings: string | null = null;

  const primaryHeading = respMatch || featMatch;

  if (primaryHeading && primaryHeading.index !== undefined) {
    if (learnMatch && learnMatch.index !== undefined && learnMatch.index > primaryHeading.index) {
      const featPart = details.substring(
        primaryHeading.index + primaryHeading[0].length,
        learnMatch.index
      );
      const learnPart = details.substring(learnMatch.index + learnMatch[0].length);
      features = splitListItems(featPart);
      learnings = formatLearnings(learnPart);
    } else {
      const after = details.substring(primaryHeading.index + primaryHeading[0].length);
      features = splitListItems(after);
    }
  } else if (learnMatch && learnMatch.index !== undefined) {
    learnings = formatLearnings(details.substring(learnMatch.index + learnMatch[0].length));
  } else if (details.includes('•') || details.includes('\n- ') || details.includes('\n* ')) {
    // Bullet items without a heading
    features = splitListItems(details);
  }

  return { featuresTitle, features, learnings };
}

function splitListItems(text: string): string[] {
  if (text.includes('•')) {
    return text.split('•').map((s) => s.trim()).filter(Boolean);
  }
  if (text.includes('\n-') || text.includes('\n*')) {
    return text.split(/\n[-*]\s+/).map((s) => s.trim()).filter(Boolean);
  }
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return text.trim() ? [text.trim()] : [];
}

function formatLearnings(text: string): string | null {
  const cleaned = text.trim();
  if (!cleaned) return null;
  if (cleaned.includes('•')) {
    return cleaned.split('•').map((s) => s.trim()).filter(Boolean).join(' • ');
  }
  return cleaned;
}

interface ProjectRowProps {
  project: Project;
  expanded: boolean;
  onToggle: (id: number) => void;
  onHover: (project: Project, e: React.MouseEvent) => void;
  onLeave: () => void;
}

function ProjectRow({ project, expanded, onToggle, onHover, onLeave }: ProjectRowProps) {
  const color = getProjectColor(project.category);
  const year = getProjectYear(project);
  const normalizedCategoryName = normalizeCategory(project.category);
  const { featuresTitle, features, learnings } = parseProjectDetails(project);

  const hasCode = !!project.githubUrl && project.githubUrl.trim() !== '' && project.githubUrl !== '#';
  const demoUrlValid = !!project.demoUrl && project.demoUrl.trim() !== '' && project.demoUrl !== '#';
  const hasExtraColumn = features.length > 0 || !!learnings;

  return (
    <div className="border-b" style={{ borderColor: LINE }}>
      <button
        type="button"
        onMouseEnter={(e) => onHover(project, e)}
        onMouseMove={(e) => onHover(project, e)}
        onMouseLeave={onLeave}
        onClick={() => onToggle(project.id)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-4 sm:gap-6 py-6 sm:py-7 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#39FF7A]"
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
          style={{ backgroundColor: color }}
        />
        <h3
          className="text-xl sm:text-2xl md:text-4xl flex-1 transition-opacity group-hover:opacity-75 font-normal tracking-tight"
          style={{ fontFamily: "'Fraunces', 'Georgia', serif", color: INK }}
        >
          {project.title}
        </h3>
        <span className="hidden md:block text-sm" style={{ color: MUTED }}>
          {normalizedCategoryName}
        </span>
        <span className="hidden sm:block text-sm w-12 text-right" style={{ color: MUTED }}>
          {year}
        </span>
        <ArrowUpRight
          size={20}
          color={INK}
          className="transition-transform duration-300 flex-shrink-0"
          style={{ transform: expanded ? "rotate(135deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-10 pl-4 sm:pl-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Description, Tech Stack, Links */}
            <div className={`flex flex-col gap-5 ${!hasExtraColumn ? 'md:col-span-2' : ''}`}>
              <p className="text-base leading-relaxed text-gray-200">
                {project.description}
              </p>

              {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border transition-colors hover:border-gray-500"
                      style={{ borderColor: LINE, color: MUTED }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(hasCode || demoUrlValid) && (
                <div className="flex flex-wrap gap-5 pt-2">
                  {hasCode && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-sm border-b pb-0.5 transition-opacity hover:opacity-70 font-medium"
                      style={{ color: INK, borderColor: INK }}
                    >
                      <Github size={15} /> View code
                    </a>
                  )}
                  {demoUrlValid && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-sm border-b pb-0.5 transition-opacity hover:opacity-70 font-medium"
                      style={{ color: INK, borderColor: INK }}
                    >
                      <ExternalLink size={15} /> Live demo
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Key Features & Learnings (Rendered only if data exists) */}
            {hasExtraColumn && (
              <div className="flex flex-col gap-5">
                {features.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color }}>
                      {featuresTitle}
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {features.map((f, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2" style={{ color: MUTED }}>
                          <span className="text-xs opacity-50 mt-1">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {learnings && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color }}>
                      What it taught me
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {learnings}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProjectsSection = () => {
  const [projectsData, setProjectsData] = useState<Project[]>(fallbackProjects);
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    project: Project;
    x: number;
    y: number;
    color: string;
    status: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch projects from Supabase on mount, falling back to local projectsData
  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const fetched = await fetchProjects();
        if (isMounted && fetched && fetched.length > 0) {
          console.log("Supabase projects loaded:", fetched.length);
          setProjectsData(fetched);
        }
      } catch (err) {
        console.error("Error fetching projects from Supabase:", err);
      }
    };
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive unique, normalized categories from real project data
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    projectsData.forEach((p) => {
      if (p.category) {
        catSet.add(normalizeCategory(p.category));
      }
    });
    return ["All", ...Array.from(catSet)];
  }, [projectsData]);

  // Filter projects by normalized category
  const visible = useMemo(() => {
    if (filter === "All") return projectsData;
    return projectsData.filter((p) => normalizeCategory(p.category) === filter);
  }, [projectsData, filter]);

  function handleHover(project: Project, e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPreview({
      project,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: getProjectColor(project.category),
      status: getProjectStatus(project),
    });
  }

  function handleLeave() {
    setPreview(null);
  }

  function handleToggle(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="w-full py-20 px-6 md:px-12 relative overflow-hidden" style={{ backgroundColor: BG }}>
      <div ref={containerRef} className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight"
              style={{ fontFamily: "'Fraunces', 'Georgia', serif", color: INK }}
            >
              Selected work
            </h2>
            <p className="text-sm sm:text-base mt-2" style={{ color: MUTED }}>
              Data-driven applications, workflows, and machine learning systems.
            </p>
          </div>
          <p className="text-sm font-mono" style={{ color: MUTED }}>
            {projectsData.length} projects · 2024–2026
          </p>
        </div>

        {/* Dynamic Underline Category Filters */}
        <div className="flex gap-x-6 gap-y-2 mb-10 pb-2 border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none md:flex-wrap">
          {categories.map((cat) => {
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className="text-sm pb-1.5 border-b-2 transition-colors cursor-pointer font-medium flex-shrink-0"
                style={{
                  color: isActive ? INK : MUTED,
                  borderColor: isActive ? ACCENT : "transparent",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Editorial Project List */}
        <div className="border-t" style={{ borderColor: LINE }}>
          {visible.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              expanded={expandedId === project.id}
              onToggle={handleToggle}
              onHover={handleHover}
              onLeave={handleLeave}
            />
          ))}
          {visible.length === 0 && (
            <div className="py-12 text-center" style={{ color: MUTED }}>
              No projects found in this category.
            </div>
          )}
        </div>

        {/* Floating Cursor Preview — Desktop Only */}
        {preview && (
          <div
            className="hidden md:block pointer-events-none absolute z-30 w-64 rounded-xl border overflow-hidden shadow-2xl backdrop-blur-md"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${preview.x + 28}px, ${preview.y - 140}px)`,
              transition: "transform 100ms ease-out, opacity 150ms ease",
              backgroundColor: "#141414",
              borderColor: LINE,
            }}
          >
            <div className="w-full h-36 relative overflow-hidden bg-[#181818]">
              <img
                src={preview.project.image || "/placeholder.png"}
                alt={preview.project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
            <div className="p-4">
              <p className="text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color: preview.color }}>
                {preview.status}
              </p>
              <p className="text-xs leading-relaxed line-clamp-3 text-gray-300">
                {preview.project.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
