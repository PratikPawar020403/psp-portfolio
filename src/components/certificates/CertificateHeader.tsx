
import React from 'react';
import { motion } from 'framer-motion';
import { Award, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export const CertificateHeader = () => {
  const isMobile = useIsMobile();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-12 md:mb-20"
    >
      <div className="flex flex-col items-center justify-center gap-6 mb-6">
        <motion.div className="relative">
          <motion.div
            variants={iconVariants}
            className="flex gap-3 items-center"
          >
            <Award className="w-8 h-8 md:w-10 md:h-10 text-[#1EAEDB]" />
            <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-[#6B4BFF]" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -z-10 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#1EAEDB]/20 to-[#6B4BFF]/20 rounded-full blur-xl"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          />
        </motion.div>
        
        <motion.h2
          variants={itemVariants} 
          className={cn(
            "font-space-grotesk font-bold bg-gradient-to-r from-[#1EAEDB] via-[#6B4BFF] to-[#1EAEDB] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient",
            isMobile ? "text-3xl sm:text-4xl" : "text-5xl md:text-6xl lg:text-7xl"
          )}
        >
          Professional Growth Journey
        </motion.h2>
      </div>
      
      <motion.p
        variants={itemVariants}
        className="text-lg sm:text-xl md:text-2xl text-gray-300 font-poppins max-w-3xl mx-auto leading-relaxed px-4"
      >
        A showcase of continuous learning and professional development through 
        <span className="bg-gradient-to-r from-[#1EAEDB] to-[#6B4BFF] bg-clip-text text-transparent font-semibold"> industry-recognized certifications</span>
      </motion.p>
    </motion.div>
  );
};
