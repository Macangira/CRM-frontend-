import { useState, useEffect, useCallback } from 'react';
import { FilterValues } from '../components/ui/FilterDrawer';

export function useUrlFilters(initialDefaults: FilterValues = {}) {
  const getFiltersFromUrl = useCallback((): FilterValues => {
    const params = new URLSearchParams(window.location.search);
    const filters: FilterValues = { ...initialDefaults };
    
    params.forEach((value, key) => {
      if (value) {
        filters[key] = value;
      }
    });

    return filters;
  }, []);

  const [filters, setFilters] = useState<FilterValues>(getFiltersFromUrl);

  const applyFilters = (newFilters: FilterValues) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value.trim());
      }
    });

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);
    setFilters(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterValues = {};
    window.history.pushState({}, '', window.location.pathname);
    setFilters(emptyFilters);
  };

  // Sync on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setFilters(getFiltersFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getFiltersFromUrl]);

  return {
    filters,
    applyFilters,
    resetFilters
  };
}
