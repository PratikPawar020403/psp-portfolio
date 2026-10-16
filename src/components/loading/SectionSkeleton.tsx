import React from 'react';

interface SectionSkeletonProps {
  type: 'hero' | 'web1' | 'web2' | 'skills' | 'projects' | 'certificates';
}

export const SectionSkeleton = ({ type }: SectionSkeletonProps) => {
  switch (type) {
    case 'hero':
    case 'web1':
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="space-y-6 max-w-2xl w-full mx-auto">
            <div className="h-10 bg-[#39FF14]/15 rounded animate-pulse" />
            <div className="h-5 bg-[#39FF14]/10 rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-[#39FF14]/10 rounded w-1/2 mx-auto animate-pulse" />
          </div>
        </div>
      );

    case 'projects':
      return (
        <div className="min-h-screen bg-[#101010] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="space-y-8 w-full max-w-2xl px-4">
            <div className="h-8 bg-white/10 rounded animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      );
  }
};