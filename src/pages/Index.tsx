// ... (imports)
import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFallback } from '@/components/LoadingFallback';
import Footer from '@/components/Footer';

import { ScrollToTop } from '@/components/navigation/ScrollToTop';
import { ScrollProgress } from '@/components/navigation/ScrollProgress';
import { KeyboardNavigation } from '@/components/navigation/KeyboardNavigation';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy-loaded components
const Web1Section = React.lazy(() =>
  import('@/components/Web1Section').catch(() => {
    toast.error('Failed to load Introduction section');
    return { default: () => null };
  })
);

const SkillsSection = React.lazy(() =>
  import('@/components/SkillsSection').catch(() => {
    toast.error('Failed to load Skills section');
    return { default: () => null };
  })
);

const ProjectsSection = React.lazy(() =>
  import('@/components/projects/ProjectsSection').catch(() => {
    toast.error('Failed to load Projects section');
    return { default: () => null };
  })
);

const SkillPowerUpsSection = React.lazy(() =>
  import('@/components/SkillPowerUpsSection').catch(() => {
    toast.error('Failed to load Skill Power-ups section');
    return { default: () => null };
  })
);

const NotebookSection = React.lazy(() =>
  import('@/components/NotebookSection').catch(() => {
    toast.error('Failed to load Notebook section');
    return { default: () => null };
  })
);


const Index = () => {
  // Enable smooth scrolling
  useEffect(() => {
    document.documentElement.classList.add('smooth-scroll', 'momentum-scroll');

    // Detect if the user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.remove('smooth-scroll');
    }

    return () => {
      document.documentElement.classList.remove('smooth-scroll', 'momentum-scroll');
    };
  }, []);

  return (
    <main id="main-content" className="relative" role="main" aria-label="Portfolio Content">
      <ScrollProgress aria-label="Page scroll progress" />
      {/* Keyboard navigation is not relevant for touch devices and adds event listeners */}
      {!useIsMobile() && <KeyboardNavigation />}

      {/* Intro Section */}
      <ScrollReveal>
        <section id="web1" aria-label="Introduction" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Web1Section />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Notebook Section */}
      <ScrollReveal>
        <section id="notebook" aria-label="Academic Notebook" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <NotebookSection />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Skills Section */}
      <ScrollReveal stagger={true}>
        <section id="skills" aria-label="Skills Overview" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <SkillsSection />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Projects Section */}
      <ScrollReveal>
        <section id="projects" aria-label="Project Showcase" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <ProjectsSection />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Skill Power-ups Section */}
      <ScrollReveal>
        <section id="skillpowerups" aria-label="Skill Certifications" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <SkillPowerUpsSection />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>


      {/* Navigation Components */}
      <Tooltip>
        <TooltipTrigger asChild>
          <ScrollToTop aria-label="Scroll to top" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Scroll to top</p>
        </TooltipContent>
      </Tooltip>

      {/* Footer */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Footer />
        </Suspense>
      </ErrorBoundary>

    </main>
  );
};

export default Index;
