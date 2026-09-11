
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

const defaultCertificates: Certificate[] = [
  { id: 1, title: 'Generative AI Mastermind', issuer: 'Outskill', date: '2024', color: 'from-blue-500 to-cyan-500', image: '/psp-uploads/008decb4-a10b-4a52-9df3-7329f72406dd.png' },
  { id: 2, title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: '2024', color: 'from-purple-500 to-indigo-500', image: '/psp-uploads/21f29b71-eb78-4c51-90a0-a9dcdffabd4b.png' },
  { id: 3, title: 'Machine Learning Professional', issuer: 'Stanford Online', date: '2023', color: 'from-emerald-500 to-teal-500', image: '/psp-uploads/22b7317c-1f47-4ea2-a84b-048bcd7a95d8.png' },
  { id: 4, title: 'AWS Cloud Solutions', issuer: 'Amazon Web Services', date: '2023', color: 'from-amber-500 to-orange-500', image: '/psp-uploads/24899f44-4123-4fca-aa7f-800ec8cfd731.png' },
];

export const CertificateCarousel: React.FC<CertificateCarouselProps> = React.memo(({
  certificates
}) => {
  const isMobile = useIsMobile();
  const [isPaused, setIsPaused] = useState(false);

  // Use provided certificates, or default certificates if database is empty/offline
  const displayCertificates = certificates && certificates.length > 0 ? certificates : defaultCertificates;
  const certificateCount = displayCertificates.length;

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
          {displayCertificates.map((certificate, index) => (
            <CarouselSlide
              key={`original-${certificate.id}`}
              certificate={certificate}
              index={index}
            />
          ))}

          {/* Duplicated certificates for infinite scrolling */}
          {displayCertificates.map((certificate, index) => (
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
