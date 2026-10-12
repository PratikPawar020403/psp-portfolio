import { useEffect, useState, useCallback } from 'react';
import { Monitor } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SECTION_IDS = ['web1', 'notebook', 'projects', 'skillpowerups'] as const;

const SECTIONS_META = [
  { key: '1', id: 'web1', label: 'WELCOME.TXT — Intro' },
  { key: '2', id: 'notebook', label: 'ACADEMIC NOTEBOOK' },
  { key: '3', id: 'projects', label: 'PROJECT SHOWCASE' },
  { key: '4', id: 'skillpowerups', label: 'SKILL POWER-UPS' },
];

export const KeyboardNavigation = () => {
  const [showManual, setShowManual] = useState(false);
  const isMobile = useIsMobile();

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(
      ((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform) ||
        navigator.platform ||
        ''
    );
  const modLabel = isMac ? 'Option' : 'Alt';

  const navigateToSection = useCallback((index: number) => {
    const id = SECTION_IDS[index];
    const target =
      (id ? document.getElementById(id) : null) ||
      document.querySelectorAll<HTMLElement>('main#main-content section[id]')[index];

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip navigation if user is typing in an input, textarea, or contentEditable element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      if (e.key === 'Escape' && showManual) {
        e.preventDefault();
        setShowManual(false);
        return;
      }

      // Match keys with event.code (Digit1..Digit4) so Option+1..4 works on macOS too
      if (e.altKey && /^Digit[1-4]$/.test(e.code)) {
        e.preventDefault();
        const index = parseInt(e.code.replace('Digit', ''), 10) - 1;
        navigateToSection(index);
        setShowManual(false);
        return;
      }

      // Open/toggle manual when pressing '?' or Alt+H
      if (
        (!e.altKey && !e.ctrlKey && !e.metaKey && e.key === '?') ||
        (e.altKey && e.code === 'KeyH')
      ) {
        e.preventDefault();
        setShowManual((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateToSection, showManual]);

  if (isMobile || !showManual) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      onClick={() => setShowManual(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pk-manual-title"
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-black/95 text-[#39ff14] border-[1.5px] border-[#39ff14]/60 shadow-[0_0_24px_rgba(57,255,20,0.25),inset_0_0_20px_rgba(57,255,20,0.08)] font-mono text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#39ff14]/35 [text-shadow:0_0_8px_rgba(57,255,20,0.6)]">
          <Monitor className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span id="pk-manual-title" className="flex-1 font-extrabold tracking-[0.12em] text-[11px]">
            MANUAL.TXT
          </span>
          <button
            type="button"
            onClick={() => setShowManual(false)}
            aria-label="Close keyboard manual"
            className="w-5 h-5 min-w-0 min-h-0 p-0 rounded text-sm font-bold leading-none opacity-75 hover:opacity-100 hover:bg-[#39ff14]/15 focus-visible:opacity-100 focus-visible:bg-[#39ff14]/15 outline-none"
          >
            &times;
          </button>
        </div>

        {/* Shortcut list */}
        <div className="p-3.5 space-y-2 [text-shadow:0_0_7px_rgba(57,255,20,0.5)]">
          {SECTIONS_META.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                navigateToSection(idx);
                setShowManual(false);
              }}
              className="w-full min-h-0 flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-[#39ff14]/10 text-left transition-colors"
            >
              <span className="truncate">&gt; {sec.label}</span>
              <span className="shrink-0">
                <kbd className="px-1.5 py-0.5 text-[11px] font-bold rounded border border-[#39ff14]/70 border-b-2 bg-[#39ff14]/10">
                  {modLabel}
                </kbd>
                +
                <kbd className="px-1.5 py-0.5 text-[11px] font-bold rounded border border-[#39ff14]/70 border-b-2 bg-[#39ff14]/10">
                  {sec.key}
                </kbd>
              </span>
            </button>
          ))}

          <div className="pt-2 mt-2 border-t border-[#39ff14]/25 flex items-center justify-between text-[11px] opacity-80">
            <span>
              <kbd className="px-1.5 py-0.5 font-bold rounded border border-[#39ff14]/70 border-b-2 bg-[#39ff14]/10">
                ?
              </kbd>{' '}
              or{' '}
              <kbd className="px-1.5 py-0.5 font-bold rounded border border-[#39ff14]/70 border-b-2 bg-[#39ff14]/10">
                {modLabel}+H
              </kbd>{' '}
              toggle manual
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 font-bold rounded border border-[#39ff14]/70 border-b-2 bg-[#39ff14]/10">
                Esc
              </kbd>{' '}
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

