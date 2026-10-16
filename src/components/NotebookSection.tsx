import React, { useState } from 'react';

const NotebookSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      id="academic-notebook-section"
      className="relative w-full h-screen h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#eef1f5]"
    >
      {/* Fallback spinner displayed underneath while iframe initial bytes stream in */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#eef1f5] flex flex-col items-center justify-center gap-3 z-0">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
          <p className="text-xs font-mono tracking-wider text-slate-500 uppercase">
            Loading Academic Notebook...
          </p>
        </div>
      )}

      {/* Immediate eager iframe: begins network connection during hero viewing so Section 2 is instant */}
      <iframe
        src="https://academic-notebook.netlify.app/"
        loading="eager"
        title="Academic Notebook"
        className={`relative z-10 w-full h-full border-none transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default NotebookSection;
