import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  announcements: string[];
  addAnnouncement: (message: string) => void;
  clearAnnouncements: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [focusMode, setFocusMode] = useState(false);

  // Check for user preferences on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size') as any;
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';
    const savedFocusMode = localStorage.getItem('accessibility-focus-mode') === 'true';

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast !== null) setHighContrast(savedHighContrast);
    if (savedReducedMotion !== null) setReducedMotion(savedReducedMotion);
    if (savedFocusMode !== null) setFocusMode(savedFocusMode);
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.setAttribute('data-font-size', fontSize);
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Focus mode
    if (focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Save preferences
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
    localStorage.setItem('accessibility-reduced-motion', reducedMotion.toString());
    localStorage.setItem('accessibility-focus-mode', focusMode.toString());
  }, [fontSize, highContrast, reducedMotion, focusMode]);

  const addAnnouncement = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Auto-clear after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 5000);
  };

  const clearAnnouncements = () => {
    setAnnouncements([]);
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const toggleFocusMode = () => {
    setFocusMode(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{
      announcements,
      addAnnouncement,
      clearAnnouncements,
      highContrast,
      toggleHighContrast,
      reducedMotion,
      toggleReducedMotion,
      fontSize,
      setFontSize,
      focusMode,
      toggleFocusMode
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};