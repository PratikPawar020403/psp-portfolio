import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import { Project } from '@/types/project';
import { fetchProjects } from '@/utils/supabaseData';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy-load the heavy WebGL background so it doesn't bloat the main bundle
// and is never downloaded on mobile
const GhostFibers = React.lazy(() => import('@/components/effects/GhostFibers'));

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
  if (project.createdAt) {
    const yearMatch = project.createdAt.match(/^(\d{4})/);
    if (yearMatch) return yearMatch[1];
    const parsedYear = new Date(project.createdAt).getFullYear();
    if (!Number.isNaN(parsedYear)) return String(parsedYear);
  }
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
 */
function parseProjectDetails(rawDetails: string | null | undefined): ParsedDetails {
  const details = (rawDetails || '').trim();
  if (!details) {
    return { featuresTitle: 'Key features', features: [], learnings: null };
  }

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

/**
 * Fallback card for images that are missing or fail to load.
 */
function ProjectImagePlaceholder({ project, className = "" }: { project: Project; className?: string }) {
  const color = getProjectColor(project.category);
  const initials =
    project.title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'PR';

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-br from-[#181818] via-[#141414] to-[#0e0e0e] select-none ${className}`}
    >
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <span
        className="font-cormorant text-5xl font-light italic tracking-wider opacity-35 mb-2"
        style={{ color }}
      >
        {initials}
      </span>
      <span className="font-cormorant font-light italic text-xs uppercase tracking-widest text-[#8A8A86]">
        {normalizeCategory(project.category)}
      </span>
    </div>
  );
}

interface ProjectRowProps {
  project: Project;
  index: number;
  expanded: boolean;
  onToggle: (id: number) => void;
  onRowMouseEnter: (project: Project, e: React.MouseEvent) => void;
  onRowMouseMove: (project: Project, e: React.MouseEvent) => void;
  onRowMouseLeave: () => void;
}

const ProjectRow = React.memo(function ProjectRow({
  project,
  index,
  expanded,
  onToggle,
  onRowMouseEnter,
  onRowMouseMove,
  onRowMouseLeave,
}: ProjectRowProps) {
  const [imgError, setImgError] = useState(false);
  const color = getProjectColor(project.category);
  const year = getProjectYear(project);
  const normalizedCategoryName = normalizeCategory(project.category);
  const { featuresTitle, features, learnings } = useMemo(
    () => parseProjectDetails(project.details),
    [project.details]
  );

  const hasCode = !!project.githubUrl && project.githubUrl.trim() !== '' && project.githubUrl !== '#';
  const demoUrlValid = !!project.demoUrl && project.demoUrl.trim() !== '' && project.demoUrl !== '#';
  const formattedIndex = String(index + 1).padStart(2, '0');

  // Alternating pattern:
  // Project 1 (index 0): Left-aligned
  // Project 2 (index 1): Right-aligned on desktop
  const isRightAligned = index % 2 === 1;
  const hasValidImage = !!project.image && project.image !== "/placeholder.png" && !imgError;

  return (
    <div
      className={`w-full border-b transition-colors duration-200 ${
        expanded ? 'bg-white/[0.02]' : ''
      }`}
      style={{ borderColor: LINE }}
    >
      {/* Clickable Row Header: Spans the full card width, triggers accordion & hover preview */}
      <button
        type="button"
        onClick={() => onToggle(project.id)}
        onMouseEnter={(e) => onRowMouseEnter(project, e)}
        onMouseMove={(e) => onRowMouseMove(project, e)}
        onMouseLeave={onRowMouseLeave}
        aria-expanded={expanded}
        aria-controls={`project-details-${project.id}`}
        className={`w-full flex items-center py-5 sm:py-6 md:py-7 px-2 sm:px-4 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#39FF7A] rounded-lg transition-colors ${
          expanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.015]'
        } ${
          isRightAligned ? 'justify-start md:justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`flex items-center flex-wrap gap-3 sm:gap-4 md:gap-5 ${
            isRightAligned ? 'text-left md:text-right' : 'text-left'
          }`}
        >
          {/* Number: left-aligned order-1; right-aligned mobile order-1, desktop md:order-6 */}
          <span
            className={`font-cormorant font-light italic text-sm sm:text-base text-[#8A8A86] tracking-wider select-none ${
              isRightAligned ? 'order-1 md:order-6' : 'order-1'
            }`}
          >
            {formattedIndex}
          </span>

          {/* Color Dot: right-aligned mobile order-2, desktop md:order-5 */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-300 ${
              expanded ? 'scale-150' : 'group-hover:scale-125'
            } ${isRightAligned ? 'order-2 md:order-5' : 'order-2'}`}
            style={{ backgroundColor: color }}
          />

          {/* Project Title in Syne ExtraBold 800 */}
          <h3
            className={`font-syne font-extrabold not-italic text-lg sm:text-xl md:text-2xl lg:text-[1.75rem] tracking-tight transition-colors duration-200 ${
              expanded ? 'text-white' : 'text-[#F5F3EE] hover:text-white'
            } ${isRightAligned ? 'order-3 md:order-4 text-left md:text-right' : 'order-3 text-left'}`}
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontStyle: 'normal' }}
          >
            {project.title}
          </h3>

          {/* Category Badge: right-aligned mobile order-4, desktop md:order-3 */}
          <span
            className={`hidden sm:inline-block text-xs sm:text-sm font-cormorant font-light italic px-2.5 py-0.5 rounded border border-[#232323] text-[#8A8A86] ${
              isRightAligned ? 'order-4 md:order-3' : 'order-4'
            }`}
          >
            {normalizedCategoryName}
          </span>

          {/* Year: right-aligned mobile order-5, desktop md:order-2 */}
          <span
            className={`hidden md:inline-block text-xs sm:text-sm font-cormorant font-light italic text-[#8A8A86] tracking-wider ${
              isRightAligned ? 'order-5 md:order-2' : 'order-5'
            }`}
          >
            {year}
          </span>

          {/* Desktop Arrow for Right-Aligned Row: md:order-1 */}
          {isRightAligned && (
            <span
              className={`hidden md:inline-flex p-1.5 rounded-full border transition-all duration-300 order-6 md:order-1 ${
                expanded
                  ? 'border-[#39FF7A]/40 bg-[#39FF7A]/10 text-[#39FF7A]'
                  : 'border-transparent text-[#8A8A86] hover:text-[#F5F3EE] hover:border-[#232323]'
              }`}
            >
              <ArrowUpRight
                size={17}
                className="transition-transform duration-300"
                style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
              />
            </span>
          )}

          {/* Standard Arrow (for Left-Aligned Rows and Mobile Right-Aligned Rows) */}
          <span
            className={`p-1.5 rounded-full border transition-all duration-300 ${
              isRightAligned ? 'md:hidden order-7' : 'order-6'
            } ${
              expanded
                ? 'border-[#39FF7A]/40 bg-[#39FF7A]/10 text-[#39FF7A]'
                : 'border-transparent text-[#8A8A86] hover:text-[#F5F3EE] hover:border-[#232323]'
            }`}
          >
            <ArrowUpRight
              size={17}
              className="transition-transform duration-300"
              style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </span>
        </div>
      </button>

      {/* Accordion Expand/Collapse Content */}
      <div
        id={`project-details-${project.id}`}
        style={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-10 pt-3 px-3 sm:px-6">
            {/* Mobile-only inline image preview */}
            <div className="md:hidden w-full aspect-[16/10] max-h-56 rounded-xl overflow-hidden border border-[#232323] bg-[#141414] mb-5">
              {hasValidImage ? (
                <img
                  src={project.image}
                  alt={project.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProjectImagePlaceholder project={project} />
              )}
            </div>

            {/* Expanded Details Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 pt-5 border-t border-white/5">
              {/* Left Column: Description, Tech Stack, Links */}
              <div className="md:col-span-7 flex flex-col gap-5">
                <div>
                  <p className="text-sm sm:text-base font-cormorant font-semibold italic uppercase tracking-wider text-gray-300 mb-2">
                    Overview
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed text-gray-200 font-cormorant font-medium italic">
                    {project.description}
                  </p>
                </div>

                {/* Tech Stack */}
                {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                  <div>
                    <p className="text-sm sm:text-base font-cormorant font-semibold italic uppercase tracking-wider text-gray-300 mb-2">
                      Technologies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs sm:text-sm font-cormorant font-medium italic px-2.5 py-0.5 rounded-full border border-white/10 text-gray-300 bg-white/[0.04] transition-colors hover:border-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Links */}
                {(hasCode || demoUrlValid) && (
                  <div className="flex flex-wrap gap-3.5 pt-1">
                    {hasCode && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-cormorant font-light italic px-3.5 py-2 rounded-lg border border-[#232323] text-[#F5F3EE] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 transition-all"
                      >
                        <Github size={14} /> View code
                      </a>
                    )}
                    {demoUrlValid && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-cormorant font-light italic px-3.5 py-2 rounded-lg border border-[#39FF7A]/30 text-[#39FF7A] bg-[#39FF7A]/10 hover:bg-[#39FF7A]/20 hover:border-[#39FF7A]/60 transition-all"
                      >
                        <ExternalLink size={14} /> Live demo
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Key Features & Learnings */}
              <div className="md:col-span-5 flex flex-col gap-5">
                {features.length > 0 && (
                  <div>
                    <p
                      className="text-sm sm:text-base font-cormorant font-semibold italic uppercase tracking-wider mb-2"
                      style={{ color }}
                    >
                      {featuresTitle}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {features.map((f, idx) => (
                        <li
                          key={idx}
                          className="text-sm sm:text-base flex items-start gap-2.5 text-gray-200 leading-relaxed font-cormorant font-medium italic"
                        >
                          <span className="text-sm opacity-90 mt-0.5 flex-shrink-0" style={{ color }}>•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {learnings && (
                  <div>
                    <p
                      className="text-sm sm:text-base font-cormorant font-semibold italic uppercase tracking-wider mb-2"
                      style={{ color }}
                    >
                      What it taught me
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed text-gray-200 font-cormorant font-medium italic">
                      {learnings}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const ProjectsSection = () => {
  const isMobile = useIsMobile();
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [filter, setFilter] = useState("All");

  // Selected project ID for expanded accordion
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Project whose card/row is currently hovered by cursor
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [previewCoords, setPreviewCoords] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });
  const rafPreviewId = useRef<number>(0);

  // Fetch projects from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const fetched = await fetchProjects();
        if (isMounted && fetched && fetched.length > 0) {
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

  // Preload top visible project images immediately; defer the rest to avoid network congestion
  useEffect(() => {
    if (visible.length === 0) return;
    const immediate = visible.slice(0, 4);
    immediate.forEach((p) => {
      if (p.image && p.image !== "/placeholder.png" && !p.image.startsWith("data:")) {
        const img = new Image();
        img.src = p.image;
      }
    });

    const remainder = visible.slice(4);
    if (remainder.length === 0) return;

    let timer: number | null = null;
    const preloadRest = () => {
      remainder.forEach((p) => {
        if (p.image && p.image !== "/placeholder.png" && !p.image.startsWith("data:")) {
          const img = new Image();
          img.src = p.image;
        }
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(
        preloadRest,
        { timeout: 2500 }
      );
      return () => {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      };
    } else {
      timer = window.setTimeout(preloadRest, 2000);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [visible]);

  // Computes clamped target coordinates inside containerRef
  const computePreviewTarget = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const previewWidth = 320;
    const previewHeight = 260;

    const isCursorOnRight = x > containerWidth * 0.55;
    let targetX = isCursorOnRight ? x - previewWidth - 28 : x + 28;
    targetX = Math.max(16, Math.min(targetX, containerWidth - previewWidth - 16));

    let targetY = y - previewHeight / 2;
    targetY = Math.max(8, Math.min(targetY, containerHeight - previewHeight - 8));

    return {
      x: Math.round(targetX),
      y: Math.round(targetY),
    };
  }, []);

  // Directly updates floating preview transform without triggering React re-renders
  const updatePreviewPosition = useCallback(() => {
    if (!previewRef.current) return;
    const target = computePreviewTarget(posRef.current.clientX, posRef.current.clientY);
    if (!target) return;
    previewRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
  }, [computePreviewTarget]);

  // Reconcile states when category filter changes
  const handleFilterChange = (newCat: string) => {
    setFilter(newCat);
    const newVisible =
      newCat === "All"
        ? projectsData
        : projectsData.filter((p) => normalizeCategory(p.category) === newCat);

    if (selectedProjectId !== null && !newVisible.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(null);
    }
    if (hoveredProject !== null && !newVisible.some((p) => p.id === hoveredProject.id)) {
      setHoveredProject(null);
    }
  };

  // Toggle project selection (opens/closes accordion)
  const handleToggle = useCallback((id: number) => {
    setSelectedProjectId((prev) => (prev === id ? null : id));
  }, []);

  // Row-level hover handlers: Hovering ANYWHERE in a row displays that project's preview
  const handleRowMouseEnter = useCallback((project: Project, e: React.MouseEvent) => {
    if (isMobile) return;
    posRef.current = { clientX: e.clientX, clientY: e.clientY };
    const target = computePreviewTarget(e.clientX, e.clientY);
    if (target) {
      setPreviewCoords(target);
    }
    setHoveredProject(project);
  }, [isMobile, computePreviewTarget]);

  const handleRowMouseMove = useCallback((_project: Project, e: React.MouseEvent) => {
    if (isMobile) return;
    posRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (!rafPreviewId.current) {
      rafPreviewId.current = requestAnimationFrame(() => {
        updatePreviewPosition();
        rafPreviewId.current = 0;
      });
    }
  }, [isMobile, updatePreviewPosition]);

  const handleRowMouseLeave = useCallback(() => {
    setHoveredProject(null);
    setPreviewCoords(null);
    if (rafPreviewId.current) {
      cancelAnimationFrame(rafPreviewId.current);
      rafPreviewId.current = 0;
    }
  }, []);

  // Track scroll while hovered so the preview dynamically maintains position beside the cursor/row
  useEffect(() => {
    if (!hoveredProject) return;

    const onScrollOrResize = () => {
      if (!rafPreviewId.current) {
        rafPreviewId.current = requestAnimationFrame(() => {
          updatePreviewPosition();
          rafPreviewId.current = 0;
        });
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { capture: true, passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, { capture: true });
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [hoveredProject, updatePreviewPosition]);

  return (
    <section
      id="projects"
      className="w-full pt-20 sm:pt-24 pb-24 px-4 sm:px-6 md:px-8 relative overflow-x-clip font-cormorant font-light italic"
      style={{ backgroundColor: BG }}
      onMouseLeave={handleRowMouseLeave}
    >
      {/* GhostFibers WebGL Background — Desktop only for performance */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 opacity-60 overflow-hidden pointer-events-none" aria-hidden="true">
          <Suspense fallback={null}>
            <GhostFibers
              lineColor="#140E35"
              glowColor="#3437A0"
              speed={0.15}
              scale={2}
              rotation={0}
              rotationSpeed={0.15}
              layers={3}
              waveAmplitude={0.012}
              waveFrequency={3}
              waveSpeed={0.12}
              layerSpeed={0.06}
              twist={0.08}
              twistFrequency={4}
              twistSpeed={0.8}
              lineFrequency={5}
              lineSpacing={2}
              lineSharpness={14}
              glowFalloff={12}
              glowIntensity={1.2}
              brightness={1.5}
              blueBoost={1.15}
              vignette={0.9}
              grain={0.04}
              dpr={1}
              fps={30}
            />
          </Suspense>
        </div>
      )}

      {/* Balanced, centered content container footprint */}
      <div ref={containerRef} className="w-full max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h2
            className="font-cormorant-garamond font-medium italic text-4xl sm:text-5xl md:text-6xl tracking-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontStyle: 'italic',
              color: INK,
            }}
          >
            Selected Work
          </h2>
          <p
            className="font-cormorant-garamond font-normal italic text-base sm:text-lg mt-2 max-w-xl text-gray-300"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontStyle: 'italic',
              color: "#D4D4D0",
            }}
          >
            From Ai-Film to data-driven applications, automations and ml systems.
          </p>
        </div>

        {/* Dynamic Category Filter Bar */}
        <div className="flex gap-x-6 sm:gap-x-8 gap-y-2 mb-10 pb-3 border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none md:flex-wrap">
          {categories.map((cat) => {
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleFilterChange(cat)}
                className="font-cormorant-garamond font-medium italic text-base sm:text-lg pb-1.5 border-b-2 transition-all cursor-pointer flex-shrink-0 flex items-center gap-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: isActive ? INK : "#A8A8A4",
                  borderColor: isActive ? ACCENT : "transparent",
                }}
              >
                {cat}
                {isActive && (
                  <span
                    className="text-xs font-cormorant-garamond font-medium italic px-1.5 py-0.2 rounded-full bg-white/10 text-white"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                      fontStyle: 'italic',
                    }}
                  >
                    {visible.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Minimal Editorial Project List with Alternating Alignment */}
        <div className="w-full border-t border-[#232323]">
          {visible.map((project, index) => {
            const isExpanded = selectedProjectId === project.id;

            return (
              <ProjectRow
                key={project.id}
                project={project}
                index={index}
                expanded={isExpanded}
                onToggle={handleToggle}
                onRowMouseEnter={handleRowMouseEnter}
                onRowMouseMove={handleRowMouseMove}
                onRowMouseLeave={handleRowMouseLeave}
              />
            );
          })}

          {visible.length === 0 && (
            <div className="py-16 text-center text-[#8A8A86] font-cormorant font-light italic text-lg">
              No projects found in this category.
            </div>
          )}
        </div>

        {/* Floating Cursor Image Preview (Triggers across the entire row/card) */}
        {!isMobile && hoveredProject && (
          <div
            ref={previewRef}
            className="hidden md:block pointer-events-none absolute z-40 w-72 sm:w-80 rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-md"
            style={{
              left: 0,
              top: 0,
              transform: previewCoords
                ? `translate3d(${previewCoords.x}px, ${previewCoords.y}px, 0)`
                : undefined,
              willChange: "transform",
              transition: "transform 75ms ease-out, opacity 180ms ease, scale 180ms ease",
              backgroundColor: "#141414",
              borderColor: LINE,
            }}
          >
            {/* Project Image Frame */}
            <div className="w-full aspect-[16/10] relative overflow-hidden bg-[#181818]">
              {hoveredProject.image && hoveredProject.image !== "/placeholder.png" ? (
                <img
                  src={hoveredProject.image}
                  alt={hoveredProject.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <ProjectImagePlaceholder project={hoveredProject} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/90 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Card Metadata */}
            <div className="p-4">
              <div className="flex items-center justify-between text-xs font-cormorant font-light italic mb-1.5">
                <span
                  className="font-light italic uppercase tracking-wider text-xs"
                  style={{ color: getProjectColor(hoveredProject.category) }}
                >
                  {getProjectStatus(hoveredProject)} · {normalizeCategory(hoveredProject.category)}
                </span>
                <span className="text-[#8A8A86] text-xs font-light italic">
                  {getProjectYear(hoveredProject)}
                </span>
              </div>
              <h4
                className="font-syne font-extrabold not-italic text-lg text-white line-clamp-1"
                style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontStyle: 'normal' }}
              >
                {hoveredProject.title}
              </h4>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
