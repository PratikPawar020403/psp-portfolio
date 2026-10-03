
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest > 0 && !hasScrolled) {
        setHasScrolled(true);
      } else if (latest === 0 && hasScrolled) {
        setHasScrolled(false);
      }
    });
    
    return () => unsubscribe();
  }, [scrollYProgress, hasScrolled]);

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ opacity }}
    >
      <motion.div
        className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 origin-left"
        style={{ scaleX }}
      />
    </motion.div>
  );
};
