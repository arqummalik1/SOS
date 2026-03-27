import { useCallback, useMemo, memo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

// Memoized list item wrapper for FlatList optimization
export const MemoizedListItem = memo(({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
});

// Optimized FlatList configuration for large datasets
export const getOptimizedFlatListProps = (itemHeight: number) => ({
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  windowSize: 5,
  removeClippedSubviews: true,
  getItemLayout: (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
});

// Memoized callback hook for event handlers
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
) => {
  return useCallback(callback, deps);
};

// Memoized value hook for expensive computations
export const useOptimizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
) => {
  return useMemo(factory, deps);
};

// Image optimization config
export const imageOptimizationConfig = {
  cache: 'force-cache' as const,
  contentFit: 'cover' as const,
  transition: 200,
};

// Batch processing for large arrays
export const batchProcess = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 50
): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    // Yield to main thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return results;
};

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Debounce function for search/filter inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
