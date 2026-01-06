import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-40 h-40'
};

export const RadialProgress = ({
  value,
  size = 'md',
  className,
  children
}: RadialProgressProps) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value]);

  const circumference = 2 * Math.PI * 45; // radius is 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const getColorClass = (value: number) => {
    if (value >= 80) return 'stroke-teal-500';
    if (value >= 60) return 'stroke-mustard-400';
    return 'stroke-red-500';
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="stroke-gray-200"
          strokeWidth="8"
          fill="transparent"
          r="45"
          cx="50%"
          cy="50%"
        />
        <circle
          className={cn(
            "transition-all duration-1000 ease-out",
            getColorClass(progress)
          )}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r="45"
          cx="50%"
          cy="50%"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};