/**
 * Calendar Hooks
 */

import { useState, useEffect } from 'react';

/**
 * Hook for localStorage persistence
 * Adapted from Next.js to work with Vite/React
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Get value from localStorage or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}