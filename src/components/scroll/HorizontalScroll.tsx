
import React, { useRef, useEffect, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  speed?: number;
  snapToItems?: boolean;
  disableOnMobile?: boolean;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  className = '',
  itemClassName = '',
  speed = 1,
  snapToItems = true,
  disableOnMobile = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  // Handle wheel event for horizontal scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || (disableOnMobile && window.innerWidth < 768)) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (!inView) return;
      
      e.preventDefault();
      const containerScrollPosition = scrollContainer.scrollLeft;
      scrollContainer.scrollTo({
        left: containerScrollPosition + (e.deltaY * speed),
        behavior: 'smooth',
      });
    };
    
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, [inView, speed, disableOnMobile]);
  
  // Set ref to both scrollContainerRef and inViewRef
  const setRefs = (element: HTMLDivElement) => {
    scrollContainerRef.current = element;
    inViewRef(element);
  };
  
  const snapClass = snapToItems ? 'scroll-snap-type-x-mandatory' : '';
  const containerClass = `h-scroll-container ${className} ${snapClass}`;
  const itemClass = `h-scroll-item ${itemClassName}`;
  
  // Wrap each child in a scroll item container
  const wrappedChildren = React.Children.map(children, (child) => (
    <div className={itemClass}>
      {child}
    </div>
  ));
  
  return (
    <div
      ref={setRefs}
      className={containerClass}
      data-horizontal-scroll
      role="region"
      aria-label="Horizontal scrollable content"
    >
      {wrappedChildren}
    </div>
  );
};
