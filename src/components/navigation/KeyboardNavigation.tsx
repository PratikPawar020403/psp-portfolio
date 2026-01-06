
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Keyboard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const KeyboardNavigation = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showHelpToast, setShowHelpToast] = useState(false);
  const isMobile = useIsMobile();
  
  const navigateToSection = useCallback((index: number) => {
    const sections = document.querySelectorAll('section');
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
      sections[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section');
    
    // Handle keyboard navigation with improved accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip navigation if user is typing in an input, textarea, or contentEditable element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Quick navigation with number keys
      if (e.key >= '1' && e.key <= '6' && e.altKey) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (navigateToSection(index)) {
          toast.success(`Navigating to section ${index + 1}`);
        }
      }

      // Show help when pressing '?' or 'h'
      if (e.key === '?' || (e.key === 'h' && e.altKey)) {
        e.preventDefault();
        setShowHelpToast(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Add help message for keyboard navigation
    const helpMessage = () => {
      toast.info(
        'Keyboard Navigation: Alt + (1-6) for quick navigation to sections, Alt+H or ? for help',
        { 
          duration: 5000,
          icon: <Keyboard className="h-4 w-4" /> 
        }
      );
    };
    
    // Show help message on first load
    const hasSeenHelp = sessionStorage.getItem('hasSeenKeyboardHelp');
    if (!hasSeenHelp && !isMobile) {
      helpMessage();
      sessionStorage.setItem('hasSeenKeyboardHelp', 'true');
    }

    // Show help toast when requested
    if (showHelpToast) {
      helpMessage();
      setShowHelpToast(false);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSectionIndex, showHelpToast, navigateToSection, isMobile]);

  // Don't render any UI for keyboard navigation on mobile
  if (isMobile) {
    return null;
  }

  return null;
};
