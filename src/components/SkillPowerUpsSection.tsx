
import React from 'react';
import { CertificateCarousel } from './certificates/CertificateCarousel';
import { CertificateHeader } from './certificates/CertificateHeader';
import { motion } from 'framer-motion';
import { useCertificates } from '@/hooks/useCertificates';

const SkillPowerUpsSection = () => {
  const { certificates, loading } = useCertificates();

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.section
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2D1B69] to-[#1a1a1a] py-12 md:py-24 lg:py-32"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {/* Background Effects */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,75,255,0.1)_0%,transparent_65%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <div className="container mx-auto max-w-[1920px] px-4 relative z-10">
        <CertificateHeader />

        {/* Timeline Label */}
        <motion.div
          className="text-center mb-8 md:mb-16"
          variants={itemVariants}
        >
          <motion.span
            className="inline-block px-4 py-1 sm:px-6 sm:py-2 rounded-full bg-[#2D1B69]/50 border border-[#6B4BFF]/30 text-gray-300 font-space-grotesk text-sm sm:text-base"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(107,75,255,0.4)"
            }}
          >
            2020 - 202?
          </motion.span>
        </motion.div>

        {loading ? (
          <motion.div
            className="text-center py-12"
            variants={itemVariants}
          >
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-purple-300 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-white">Loading certificates...</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="relative">
            <CertificateCarousel certificates={certificates} />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default SkillPowerUpsSection;
