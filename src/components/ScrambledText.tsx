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
  const rafRef = useRef<number | null>(null);
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

    // Clear any existing animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const element = textRef.current;
    const totalDurationMs = Math.max(200, (duration || 1.5) * 1000);
    const startTime = performance.now();
    const charsLen = scrambleChars.length;
    const textLen = originalText.length;

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);
      const revealedCount = Math.floor(progress * textLen);

      let output = "";
      for (let i = 0; i < textLen; i++) {
        const char = originalText[i];
        if (char === " ") {
          output += " ";
        } else if (i < revealedCount) {
          output += char;
        } else {
          output += scrambleChars[Math.floor(Math.random() * charsLen)];
        }
      }

      element.innerText = output;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        element.innerText = originalText;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [duration, originalText, scrambleChars]);

  const handleInteraction = () => {
    const now = Date.now();
    if (now - lastTriggerTime.current < 400) return; // 400ms debounce
    lastTriggerTime.current = now;
    scrambleText();
  };

  // Expose trigger method via ref
  useImperativeHandle(ref, () => ({
    trigger: scrambleText
  }), [scrambleText]);

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(scrambleText, 300);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, scrambleText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
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
