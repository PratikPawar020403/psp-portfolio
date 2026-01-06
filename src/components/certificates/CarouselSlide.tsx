
import React from 'react';
import { cn } from "@/lib/utils";
import { CertificateCard } from './CertificateCard';
import { Certificate } from '@/types/certificate';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface CarouselSlideProps {
  certificate: Certificate;
  index: number;
  selectedIndex?: number;
  isCopy?: boolean;
}

export const CarouselSlide: React.FC<CarouselSlideProps> = React.memo(({ 
  certificate, 
  index,
  selectedIndex = 0,
  isCopy = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "carousel-slide flex-none",
        isMobile ? "w-[85vw] sm:w-[70vw] md:w-[400px]" : "w-[350px] md:w-[400px] lg:w-[450px]",
        "px-2 md:px-4",
      )}
      role="group"
      aria-label={certificate.title}
    >
      <CertificateCard 
        {...certificate}
        isMobile={isMobile}
      />
    </div>
  );
});

CarouselSlide.displayName = 'CarouselSlide';
