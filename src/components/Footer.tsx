
import React from 'react';
import { Github, Mail } from 'lucide-react';
import TrueFocus from './effects/TrueFocus';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#040405] text-white py-12 md:py-24 relative overflow-hidden border-t border-gray-900/30">
      {/* Background Gradient - Deep Focus */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040405] via-[#0a0a0c] to-[#040405] opacity-95" />

      {/* PSP Logo with TrueFocus Effect */}
      <div className="flex justify-center mb-8 md:mb-16 relative">
        <TrueFocus
          sentence="प्र ति क"
          className="font-['Tillana'] font-bold"
          blurAmount={4}
          borderColor="#4B5056"
          glowColor="rgba(209, 213, 219, 0.35)"
          animationDuration={0.5}
          initialFocusIndex={0}
        />

        {/* Glow Effect - Soft Diffused White */}
        <div className="absolute inset-0 blur-3xl bg-gray-100/5 -z-10" />
      </div>

      {/* Social Links */}
      <div className="flex justify-center gap-6 sm:gap-12 mb-8 sm:mb-12 relative z-10">
        <a
          href="https://github.com/PratikPawar020403"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center p-2 hover:text-blue-400 transition-colors duration-300"
          aria-label="GitHub"
        >
          <Github className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" />
        </a>

        <a
          href="mailto:pratikpawar0222@gmail.com"
          className="group flex items-center justify-center p-2 hover:text-blue-400 transition-colors duration-300"
          aria-label="Email"
        >
          <Mail className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" />
        </a>
      </div>

      {/* 2025 Loading */}
      <div className="text-center relative mt-6 sm:mt-0">
        <div className="inline-block">
          <div className="relative">
            <span className="font-space-grotesk text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] text-white/70 animate-pulse">
              2026 LOADING...
            </span>
            {/* Progress Bar */}
            <div className="mt-2 w-32 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-blue-400 w-1/3 animate-[loading_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
