import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Monitor, Save, Mail } from 'lucide-react';
// import FaultyTerminal from './FaultyTerminal'; // DIRECT IMPORT REMOVED FOR PERF
import ScrambledText, { ScrambledTextHandle } from './ScrambledText';

import { useIsMobile } from '@/hooks/use-mobile'; // Import hook

// Lazy load the heavy terminal component so it doesn't bloat the main bundle
// and is NEVER downloaded on mobile (SRE P0 Fix)
const FaultyTerminal = React.lazy(() => import('./FaultyTerminal'));

const Web1Section = () => {
  const isMobile = useIsMobile(); // Initialize hook
  // Optimize DPR for performance on high-res screens
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

  // Refs for animation control
  const scrambledTextRef1 = useRef<ScrambledTextHandle>(null);
  const scrambledTextRef2 = useRef<ScrambledTextHandle>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);

  const [hasAnimated, setHasAnimated] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  // Defer heavy terminal rendering slightly to prioritize LCP
  useEffect(() => {
    // Start showing terminal shortly after mount, giving LCP text priority
    const t = setTimeout(() => setShowTerminal(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Viewport detection for animation trigger
  useEffect(() => {
    if (hasAnimated) return;
    if (!animationContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Trigger animations only on desktop to save CPU (SRE P0)
          if (!isMobile) {
            // Trigger first animation
            scrambledTextRef1.current?.trigger();

            // Trigger second animation after 500ms delay
            setTimeout(() => {
              scrambledTextRef2.current?.trigger();
            }, 500);
          }

          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(animationContainerRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-black text-[#39FF14] relative overflow-hidden">
      {/* FaultyTerminal Background - Disabled on Mobile for Performance (SRE P0) */}
      <div className="absolute inset-0 z-0">
        {!isMobile && showTerminal && (
          <Suspense fallback={null}>
            <FaultyTerminal
              tint="#39FF14"
              mouseReact={true}
              mouseStrength={0.2}
              scanlineIntensity={0.3}
              glitchAmount={1}
              flickerAmount={1}
              curvature={0.2}
              chromaticAberration={0}
              pageLoadAnimation={true}
              brightness={1}
              scale={1}
              gridMul={[2, 1]}
              digitSize={1.5}
              dpr={dpr}
              className="w-full h-full opacity-80"
            />
          </Suspense>
        )}
        {/* Mobile Fallback Background */}
        {isMobile && (
          <div className="w-full h-full bg-[#0a0a0a] opacity-80" />
        )}
      </div>

      {/* CRT Effect Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="container max-w-4xl relative z-20">
        <div
          ref={animationContainerRef}
          className="clean-card bg-black/5 backdrop-blur-sm border-4 border-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.3)] relative mt-8"
        >

          {/* Title Bar */}
          <div className="flex items-center gap-4 border-b-4 border-[#39FF14]/50 pb-4 mb-8">
            <Monitor className="w-8 h-8 animate-pulse" />
            <Mail className="w-8 h-8 animate-bounce" />
            <Save className="w-8 h-8 animate-spin-slow" />
            <span className="text-[#39FF14] font-bold tracking-wider font-press-start text-lg">WELCOME.HTML</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-press-start text-[#39FF14] tracking-wider uppercase shadow-[0_0_10px_rgba(57,255,20,0.5)] text-center mb-8 text-2xl md:text-3xl lg:text-4xl">
            <ScrambledText
              ref={scrambledTextRef1}
              duration={2}
              scrambleChars="!@#$%^&*()_+-=[]{}|;:,.<>?"
              triggerOnMount={false}
            >
              Welcome to My Portfolio
            </ScrambledText>
          </h1>

          {/* Marquee */}
          <div className="mb-8 overflow-hidden whitespace-nowrap border-y-2 border-[#39FF14]/30 py-3">
            <div className="animate-marquee inline-block text-lg md:text-xl">
              ENTER THE CODE LAB * BUFFERING CREATIVITY * CTRL+ALT+CREATE * BUILD THE FUTURE TODAY * CREATE. DEVELOP. INNOVATE. *
            </div>
          </div>

          {/* Description */}
          <div className="font-vt323 text-2xl md:text-3xl lg:text-4xl mb-8 text-center leading-relaxed">
            <p className="font-normal text-2xl">
              <ScrambledText
                ref={scrambledTextRef2}
                duration={3}
                scrambleChars=".:|"
                triggerOnMount={false}
              >
                {"Namaste! I'm <Pratik S Pawar>, a developer passionate about crafting the web with logic and creativity. My only tech stack: my brain"}
              </ScrambledText>
              <span className="inline-block w-3 h-6 bg-[#39FF14] animate-blink ml-2">_</span>
            </p>
          </div>

          {/* Terminal Box - Enhanced Interactive Display */}
          <div className="mb-8">

          </div>

          {/* Decorative Element */}
          <div className="text-center mb-8">
            <div className="text-[#39FF14] text-2xl md:text-3xl">
              ▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Web1Section;
