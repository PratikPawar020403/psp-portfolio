
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
  threshold = 0.1,
  delay = 0,
  stagger = false,
  disabled = false,
  rootMargin = '0px 0px -10% 0px',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (disabled) return;
    
    const element = ref.current;
    if (!element) return;
    
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (stagger) {
              element.classList.add('active');
            } else {
              element.classList.add('visible');
            }
          }, delay);
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
  
  const baseClass = stagger ? 'stagger-reveal' : 'fade-up';
  const combinedClassName = `${baseClass} ${className}`;
  
  return (
    <div ref={ref} className={combinedClassName}>
      {children}
    </div>
  );
};
