import React from 'react';
import { CarouselSlide } from './CarouselSlide';
import { Certificate } from '@/types/certificate';

interface CertificateCarouselProps {
  certificates: Certificate[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const defaultCertificates: Certificate[] = [
  { id: 1, title: 'Generative AI Mastermind', issuer: 'Outskill', date: '2024', color: 'from-blue-500 to-cyan-500', image: '/psp-uploads/008decb4-a10b-4a52-9df3-7329f72406dd.png' },
  { id: 2, title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: '2024', color: 'from-purple-500 to-indigo-500', image: '/psp-uploads/21f29b71-eb78-4c51-90a0-a9dcdffabd4b.png' },
  { id: 3, title: 'Machine Learning Professional', issuer: 'Stanford Online', date: '2023', color: 'from-emerald-500 to-teal-500', image: '/psp-uploads/22b7317c-1f47-4ea2-a84b-048bcd7a95d8.png' },
  { id: 4, title: 'AWS Cloud Solutions', issuer: 'Amazon Web Services', date: '2023', color: 'from-amber-500 to-orange-500', image: '/psp-uploads/24899f44-4123-4fca-aa7f-800ec8cfd731.png' },
];

export const CertificateCarousel: React.FC<CertificateCarouselProps> = React.memo(({
  certificates
}) => {
  // Use provided certificates, or default certificates if database is empty/offline
  const displayCertificates = certificates && certificates.length > 0 ? certificates : defaultCertificates;
  const certificateCount = displayCertificates.length;
  const needsDuplicateSet = certificateCount < 8;

  return (
    <div
      className="certificates-carousel relative group"
      role="region"
      aria-label="Certificate carousel"
      aria-roledescription="carousel"
    >
      <div className="certificates-track flex">
        {displayCertificates.map((certificate, index) => (
          <CarouselSlide
            key={`original-${certificate.id}`}
            certificate={certificate}
            index={index}
          />
        ))}

        {needsDuplicateSet &&
          displayCertificates.map((certificate, index) => (
            <CarouselSlide
              key={`duplicate-${certificate.id}`}
              certificate={certificate}
              index={index + certificateCount}
              isCopy={true}
            />
          ))}
      </div>
    </div>
  );
});

CertificateCarousel.displayName = 'CertificateCarousel';

