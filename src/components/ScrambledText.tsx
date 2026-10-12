import React, { useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface ScrambledTextHandle {
  trigger: () => void;
}

export interface ScrambledTextProps {
  duration?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: string;
  triggerOnMount?: boolean;
}

const ScrambledText = forwardRef<ScrambledTextHandle, ScrambledTextProps>(({
  duration = 2,
  scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?",
  className = "",
  style = {},
  children,
  triggerOnMount = true,
}, ref) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggerTime = useRef(0);
  const originalText = children;

  const scrambleText = useCallback(() => {
    if (!textRef.current) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      textRef.current.innerText = originalText;
      return;
    }

    // Clear any existing animation
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const element = textRef.current;

    // START with original text to ensure LCP is instantly readable by browser
    element.innerText = originalText;

    // Then optionally start scrambling if not reduced motion
    // ... logic continues below for animation loop ... 

    let iterations = 0;
    const totalTicks = duration > 0 ? (duration * 1000) / 50 : originalText.length * 3;
    const step = originalText.length / Math.max(1, totalTicks);

    intervalRef.current = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iterations) {
            return originalText[index];
          }
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join('');

      if (iterations >= originalText.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      iterations += step;
    }, 50);
  }, [duration, originalText, scrambleChars]);

  const handleInteraction = () => {
    const now = Date.now();
    if (now - lastTriggerTime.current < 500) return; // 500ms debounce
    lastTriggerTime.current = now;
    scrambleText();
  };

  // Expose trigger method via ref
  useImperativeHandle(ref, () => ({
    trigger: scrambleText
  }), [scrambleText]);

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(scrambleText, 500);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, scrambleText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={textRef}
      className={`scrambled-text ${className}`}
      style={{ fontFamily: 'monospace', ...style }}
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
    >
      {originalText}
    </span>
  );
});

ScrambledText.displayName = 'ScrambledText';

export default ScrambledText;
