import { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import type { RootState } from '../store';

/**
 * Performance-optimized selector hook that prevents unnecessary re-renders
 * Uses shallow equality checking by default
 */
export function useOptimizedSelector<T>(
  selector: (state: RootState) => T,
  equalityFn: (left: T, right: T) => boolean = shallowEqual
): T {
  return useSelector(selector, equalityFn);
}

/**
 * Memoized selector hook for expensive computations
 */
export function useMemoizedSelector<T>(
  selector: (state: RootState) => T,
  deps?: React.DependencyList
): T {
  const memoizedSelector = useMemo(() => selector, deps ? [selector, ...deps] : [selector]);
  return useSelector(memoizedSelector, shallowEqual);
}

/**
 * Hook for selecting multiple values with optimization
 */
export function useMultiSelector<T extends Record<string, unknown>>(
  selectors: { [K in keyof T]: (state: RootState) => T[K] }
): T {
  return useSelector((state: RootState) => {
    const result = {} as T;
    for (const key in selectors) {
      result[key] = selectors[key](state);
    }
    return result;
  }, shallowEqual);
}

/**
 * Performance monitoring hook for Redux selectors
 */
export function usePerformanceMonitor<T>(
  name: string,
  selector: (state: RootState) => T
): T {
  const startTime = performance.now();
  const result = useSelector(selector);
  
  if (process.env.NODE_ENV === 'development') {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 1) { // Log selectors taking more than 1ms
      console.warn(`Slow selector "${name}": ${duration.toFixed(2)}ms`);
    }
  }
  
  return result;
}