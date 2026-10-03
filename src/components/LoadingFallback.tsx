import React from 'react';
import { SectionSkeleton } from './loading/SectionSkeleton';
import { useLocation } from 'react-router-dom';

export const LoadingFallback = () => {
  const location = useLocation();
  const path = location.hash.slice(1) || 'hero';

  return (
    <SectionSkeleton 
      type={path as 'hero' | 'web1' | 'web2' | 'skills' | 'projects' | 'certificates'} 
    />
  );
};