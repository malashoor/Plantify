import { useState, useEffect, useCallback } from 'react';
import type { Guide } from './useWateringGuides';

export function useTreatmentGuides(): { guides: Guide[]; isLoading: boolean; isError: boolean } {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('https://api.plantify.app/guides/treatment');
      if (!res.ok) throw new Error('Failed to fetch treatment guides');
      const json = await res.json();
      setGuides(json.data);
    } catch (error) {
      console.error('Error fetching treatment guides:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { guides, isLoading, isError };
} 