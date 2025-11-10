import { useEffect, RefObject } from 'react';

interface KeyboardShortcutsConfig {
  searchInputRef: RefObject<HTMLInputElement | null>;
  onToggleFavorites?: () => void;
}

/**
 * Custom hook for handling keyboard shortcuts in the sidebar
 */
export function useKeyboardShortcuts({
  searchInputRef,
  onToggleFavorites,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isModifierPressed = e.ctrlKey || e.metaKey;

      // Prevent shortcuts when typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Allow Ctrl/Cmd+K even in inputs
        if (!(isModifierPressed && e.key.toLowerCase() === 'k')) {
          return;
        }
      }

      // Ctrl/Cmd + K: Focus search
      if (isModifierPressed && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // Ctrl/Cmd + F: Toggle favorites filter
      if (isModifierPressed && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onToggleFavorites?.();
        return;
      }

      // Escape: Clear search when focused
      if (e.key === 'Escape' && searchInputRef.current && searchInputRef.current === document.activeElement) {
        e.preventDefault();
        searchInputRef.current.value = '';
        searchInputRef.current.blur();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [searchInputRef, onToggleFavorites]);
}

