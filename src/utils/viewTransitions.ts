/**
 * Modern view transitions utility for ultra-smooth theme switching
 * Uses native View Transitions API for best performance
 */

// Check if View Transitions API is supported
export const isViewTransitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 'startViewTransition' in document;
};

// View transition wrapper function
export const withViewTransition = (callback: () => void | Promise<void>) => {
  if (!isViewTransitionSupported()) {
    callback();
    return;
  }

  // Use native View Transitions API for ultra-smooth animations
  document.startViewTransition(async () => {
    await callback();
  });
};

// Theme-specific transition
export const themeTransition = (themeToggleCallback: () => void) => {
  if (!isViewTransitionSupported()) {
    // Fallback for unsupported browsers
    document.documentElement.style.transition = 'all 0.3s ease-in-out';
    themeToggleCallback();
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
    return;
  }

  // Use View Transitions API for supported browsers
  document.startViewTransition(() => {
    themeToggleCallback();
  });
};

// Enhanced transition with custom animation
export const enhancedThemeTransition = (themeToggleCallback: () => void) => {
  if (!isViewTransitionSupported()) {
    // Enhanced fallback with better performance
    const root = document.documentElement;
    root.style.setProperty('--transition-duration', '0.25s');
    root.style.transition = 'color-scheme 0.25s ease-out';
    
    themeToggleCallback();
    
    setTimeout(() => {
      root.style.transition = '';
      root.style.removeProperty('--transition-duration');
    }, 250);
    return;
  }

  // Use native API with custom CSS animation
  const transition = document.startViewTransition(() => {
    themeToggleCallback();
  });

  // Optional: Add custom transition timing
  transition.ready.then(() => {
    document.documentElement.style.setProperty(
      'view-transition-duration', 
      '0.25s'
    );
  });
};