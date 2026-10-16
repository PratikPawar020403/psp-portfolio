
import React, { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  stagger?: boolean;
  disabled?: boolean;
  rootMargin?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  threshold = 0.02,
  delay = 0,
  stagger = false,
  disabled = false,
  rootMargin = '0px 0px -30px 0px',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (disabled) return;
    
    const element = ref.current;
    if (!element) return;
    
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      element.classList.add(stagger ? 'active' : 'visible');
      return;
    }
    
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              if (stagger) {
                element.classList.add('active');
              } else {
                element.classList.add('visible');
              }
            }, delay);
          } else {
            if (stagger) {
              element.classList.add('active');
            } else {
              element.classList.add('visible');
            }
          }
          observer.unobserve(element);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin,
    });
    
    observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, delay, disabled, stagger, rootMargin]);
  
  const baseClass = disabled ? '' : stagger ? 'stagger-reveal' : 'fade-up';
  const combinedClassName = `${baseClass} ${className}`.trim();
  
  return (
    <div ref={ref} className={combinedClassName}>
      {children}
    </div>
  );
};
