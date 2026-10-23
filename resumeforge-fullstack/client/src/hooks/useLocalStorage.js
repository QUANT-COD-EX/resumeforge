import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust localStorage hook with instant synchronous persistence,
 * deep default merging, and beforeunload flushing so data is never lost on refresh.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) return initialValue;
      const parsed = JSON.parse(item);

      // Deep merge for objects to prevent missing nested keys
      if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
        return {
          ...initialValue,
          ...parsed,
          meta: { ...(initialValue.meta || {}), ...(parsed?.meta || {}) },
          personal: { ...(initialValue.personal || {}), ...(parsed?.personal || {}) },
          skills: {
            technical: Array.isArray(parsed?.skills?.technical) ? parsed.skills.technical : initialValue.skills?.technical || [],
            tools: Array.isArray(parsed?.skills?.tools) ? parsed.skills.tools : initialValue.skills?.tools || [],
            soft: Array.isArray(parsed?.skills?.soft) ? parsed.skills.soft : initialValue.skills?.soft || []
          },
          education: Array.isArray(parsed?.education) ? parsed.education : initialValue.education || [],
          experience: Array.isArray(parsed?.experience) ? parsed.experience : initialValue.experience || [],
          projects: Array.isArray(parsed?.projects) ? parsed.projects : initialValue.projects || []
        };
      }
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const valueRef = useRef(storedValue);
  valueRef.current = storedValue;

  const setValue = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        valueRef.current = nextValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (writeErr) {
          console.error(`Error writing to localStorage key "${key}":`, writeErr);
        }
        return nextValue;
      });
    } catch (error) {
      console.error(`Error updating state for key "${key}":`, error);
    }
  }, [key]);

  // Synchronous flush on page reload or tab navigation, and multi-tab synchronization
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        if (valueRef.current !== undefined) {
          window.localStorage.setItem(key, JSON.stringify(valueRef.current));
        }
      } catch (err) {
        console.error(`Error flushing key "${key}" on beforeunload:`, err);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setStoredValue(parsed);
          valueRef.current = parsed;
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
