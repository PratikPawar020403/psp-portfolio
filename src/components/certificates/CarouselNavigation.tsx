
import React from 'react';
import { motion } from 'framer-motion';

interface CarouselNavigationProps {
  isPaused: boolean;
}

export const CarouselNavigation = ({ isPaused }: CarouselNavigationProps) => {  
  return (
    <>
      {/* Pause/Play indicator */}
      {isPaused && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-4 bg-[#2D1B69]/80 text-white px-3 py-1.5 text-xs rounded-full border border-[#6B4BFF]/30 backdrop-blur-sm z-10"
        >
          Paused
        </motion.div>
      )}
    </>
  );
};
