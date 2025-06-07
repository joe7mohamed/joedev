import React, { createContext, useContext, useEffect, useState } from 'react';
import { enhancedThemeTransition } from '../utils/viewTransitions';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with a safe default and check for SSR
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Apply theme changes to DOM
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const root = document.documentElement;
    
    try {
      if (isDarkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  }, [isDarkMode, isMounted]);

  const toggleTheme = () => {
    if (!isMounted || typeof window === 'undefined') return;

    setIsTransitioning(true);
    
    try {
      // Use enhanced View Transitions API for ultra-smooth theme switching
      enhancedThemeTransition(() => {
        setIsDarkMode(prev => !prev);
      });
      
      // Clean up transition state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.warn('Failed to toggle theme:', error);
      setIsTransitioning(false);
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isTransitioning }}>
      <div className={`theme-transition ${isTransitioning ? 'transitioning' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};