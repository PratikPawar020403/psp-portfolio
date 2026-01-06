
import React, { useState } from 'react';
import { CarouselSlide } from './CarouselSlide';
import { Certificate } from '@/types/certificate';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { CarouselNavigation } from './CarouselNavigation';
import { motion } from 'framer-motion';

interface CertificateCarouselProps {
  certificates: Certificate[];
}

export const CertificateCarousel: React.FC<CertificateCarouselProps> = React.memo(({
  certificates
}) => {
  const isMobile = useIsMobile();
  const [isPaused, setIsPaused] = useState(false);

  // Calculate how many certificates to show for visual balance
  const certificateCount = certificates.length;

  // Handle pause on hover
  const handleMouseEnter = React.useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsPaused(false);
  }, []);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Move the tooltip above the carousel */}
      <motion.div
        className="hidden md:block mx-auto text-center mb-6 bg-[#2D1B69]/80 text-white text-xs px-4 py-2 rounded-full border border-[#6B4BFF]/30 backdrop-blur-sm z-10 w-fit"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Hover to pause
      </motion.div>

      <div
        className={cn(
          "certificates-carousel relative overflow-hidden group",
          isMobile ? "px-4" : "px-8 md:px-12 lg:px-20"
        )}
        role="region"
        aria-label="Certificate carousel"
        aria-roledescription="carousel"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={cn(
            "certificates-track flex",
            isPaused ? "paused" : ""
          )}
        >
          {/* Original certificates */}
          {certificates.map((certificate, index) => (
            <CarouselSlide
              key={`original-${certificate.id}`}
              certificate={certificate}
              index={index}
            />
          ))}

          {/* Duplicated certificates for infinite scrolling */}
          {certificates.map((certificate, index) => (
            <CarouselSlide
              key={`duplicate-${certificate.id}`}
              certificate={certificate}
              index={index + certificateCount}
              isCopy={true}
            />
          ))}
        </div>

        {/* Navigation information */}
        <CarouselNavigation isPaused={isPaused} />
      </div>
    </motion.div>
  );
});

CertificateCarousel.displayName = 'CertificateCarousel';
