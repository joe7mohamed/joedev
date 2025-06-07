/**
 * Performance monitoring for theme transitions
 * Helps identify performance bottlenecks
 */

export const measureThemeTransition = (callback: () => void): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to measure actual render time
    requestAnimationFrame(() => {
      callback();
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Theme transition took ${duration.toFixed(2)}ms`);
        }
        
        resolve(duration);
      });
    });
  });
};

export const optimizeForPerformance = () => {
  // Enable hardware acceleration hints
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      body { 
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Defer non-critical optimizations
  setTimeout(optimizeForPerformance, 100);
}