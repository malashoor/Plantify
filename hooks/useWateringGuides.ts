import { useState, useEffect, useCallback } from 'react';

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface ApiResponse {
  data: Guide[];
}

export function useWateringGuides(): { guides: Guide[]; isLoading: boolean; isError: boolean } {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('https://api.plantify.app/guides/watering') as Response;
      if (!res.ok) throw new Error('Failed to fetch watering guides');
      const json = await res.json() as ApiResponse;
      setGuides(json.data);
    } catch (error) {
      console.error('Error fetching watering guides:', error);
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