import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFallback } from '@/components/LoadingFallback';

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


import NotebookSection from '@/components/NotebookSection';

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

const Footer = React.lazy(() =>
  import('@/components/Footer').catch(() => {
    return { default: () => null };
  })
);


const Index = () => {
  // Enable smooth scrolling after PSP intro completes (or immediately if skipped)
  useEffect(() => {
    const enableSmoothScroll = () => {
      document.documentElement.classList.add('smooth-scroll', 'momentum-scroll');

      // Detect if the user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        document.documentElement.classList.remove('smooth-scroll');
      }
    };

    const html = document.documentElement;
    if (!html.classList.contains('psp-intro-active')) {
      enableSmoothScroll();
    } else {
      window.addEventListener('psp:done', enableSmoothScroll, { once: true });
    }

    return () => {
      window.removeEventListener('psp:done', enableSmoothScroll);
      document.documentElement.classList.remove('smooth-scroll', 'momentum-scroll');
    };
  }, []);

  const [mountBelowFold, setMountBelowFold] = React.useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.documentElement.classList.contains('psp-intro-active');
  });

  useEffect(() => {
    if (mountBelowFold) return;
    const enableBelowFold = () => setMountBelowFold(true);
    window.addEventListener('psp:reveal', enableBelowFold, { once: true });
    window.addEventListener('psp:done', enableBelowFold, { once: true });
    window.addEventListener('scroll', enableBelowFold, { once: true, passive: true });
    window.addEventListener('wheel', enableBelowFold, { once: true, passive: true });
    window.addEventListener('touchstart', enableBelowFold, { once: true, passive: true });
    const timer = setTimeout(enableBelowFold, 3000);
    return () => {
      window.removeEventListener('psp:reveal', enableBelowFold);
      window.removeEventListener('psp:done', enableBelowFold);
      window.removeEventListener('scroll', enableBelowFold);
      window.removeEventListener('wheel', enableBelowFold);
      window.removeEventListener('touchstart', enableBelowFold);
      clearTimeout(timer);
    };
  }, [mountBelowFold]);

  return (
    <main id="main-content" className="relative" role="main" aria-label="Portfolio Content">
      <ScrollProgress aria-label="Page scroll progress" />
      {/* Keyboard navigation is not relevant for touch devices and adds event listeners */}
      {!useIsMobile() && <KeyboardNavigation />}

      {/* Intro Section */}
      <ScrollReveal disabled>
        <section id="web1" aria-label="Introduction" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Web1Section />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Notebook Section */}
      <ScrollReveal disabled>
        <section id="notebook" aria-label="Academic Notebook" role="region" className="snap-section">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <NotebookSection />
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Projects Section */}
      <ScrollReveal>
        <section id="projects" aria-label="Project Showcase" role="region" className="snap-section bg-[#101010]">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {mountBelowFold ? <ProjectsSection /> : <LoadingFallback />}
            </Suspense>
          </ErrorBoundary>
        </section>
      </ScrollReveal>

      {/* Skill Power-ups Section */}
      <ScrollReveal>
        <section id="skillpowerups" aria-label="Skill Certifications" role="region" className="snap-section bg-[#ecebe4]">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {mountBelowFold ? <SkillPowerUpsSection /> : <LoadingFallback />}
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
          {mountBelowFold ? <Footer /> : null}
        </Suspense>
      </ErrorBoundary>

    </main>
  );
};

export default Index;
