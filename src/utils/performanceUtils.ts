/**
 * Performance analysis and optimization utilities
 */

interface ComponentPerformance {
  name: string;
  renderCount: number;
  totalTime: number;
  averageTime: number;
  slowRenders: number;
  lastRender: number;
}

class PerformanceAnalyzer {
  private components = new Map<string, ComponentPerformance>();
  private isEnabled = process.env.NODE_ENV === 'development';

  startMeasurement(): number {
    if (!this.isEnabled) return 0;
    return performance.now();
  }

  endMeasurement(componentName: string, startTime: number): void {
    if (!this.isEnabled) return;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const existing = this.components.get(componentName);
    
    if (existing) {
      existing.renderCount += 1;
      existing.totalTime += renderTime;
      existing.averageTime = existing.totalTime / existing.renderCount;
      existing.lastRender = renderTime;
      
      if (renderTime > 16) { // 60fps threshold
        existing.slowRenders += 1;
      }
    } else {
      this.components.set(componentName, {
        name: componentName,
        renderCount: 1,
        totalTime: renderTime,
        averageTime: renderTime,
        slowRenders: renderTime > 16 ? 1 : 0,
        lastRender: renderTime,
      });
    }

    // Log performance warnings
    if (renderTime > 50) {
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  getReport(): ComponentPerformance[] {
    return Array.from(this.components.values())
      .sort((a, b) => b.averageTime - a.averageTime);
  }

  getComponentStats(componentName: string): ComponentPerformance | undefined {
    return this.components.get(componentName);
  }

  reset(): void {
    this.components.clear();
  }

  // Automated performance suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const report = this.getReport();

    for (const component of report) {
      if (component.averageTime > 30) {
        suggestions.push(`Consider optimizing ${component.name} - average render time: ${component.averageTime.toFixed(2)}ms`);
      }
      
      if (component.slowRenders > component.renderCount * 0.1) {
        suggestions.push(`${component.name} has frequent slow renders (${component.slowRenders}/${component.renderCount})`);
      }
      
      if (component.renderCount > 100) {
        suggestions.push(`${component.name} renders frequently (${component.renderCount} times) - consider React.memo`);
      }
    }

    return suggestions;
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();

/**
 * State management performance utilities
 */
export const statePerformance = {
  // Measure Redux action performance
  measureAction: (actionType: string, fn: () => void) => {
    if (process.env.NODE_ENV !== 'development') {
      fn();
      return;
    }
    
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    if (duration > 5) {
      console.warn(`🔄 Slow Redux action: ${actionType} took ${duration.toFixed(2)}ms`);
    }
  },

  // Monitor selector performance
  measureSelector: <T>(selectorName: string, selector: () => T): T => {
    if (process.env.NODE_ENV !== 'development') {
      return selector();
    }
    
    const startTime = performance.now();
    const result = selector();
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    if (duration > 2) {
      console.warn(`🔍 Slow selector: ${selectorName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  },
};

// Global performance monitoring
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add performance monitoring to window for debugging
  (window as unknown as { performanceAnalyzer: PerformanceAnalyzer }).performanceAnalyzer = performanceAnalyzer;
  
  // Log performance report periodically
  setInterval(() => {
    const suggestions = performanceAnalyzer.getOptimizationSuggestions();
    if (suggestions.length > 0) {
      console.group('🔧 Performance Optimization Suggestions');
      suggestions.forEach(suggestion => console.info(suggestion));
      console.groupEnd();
    }
  }, 30000); // Every 30 seconds
}

export default performanceAnalyzer;