import { useState, useEffect } from 'react';

export interface GrowthPoint {
  date: string;
  heightCm: number;
  ph?: number;
  ec?: number;
  temperature?: number;
}

export function useGrowthData(plantId: string) {
  const [data, setData] = useState<GrowthPoint[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`https://api.plantify.app/plants/${plantId}/growth`);
        if (!res.ok) throw new Error('Failed to fetch growth data');
        const json = await res.json();
        setData(json.data);
      } catch (error) {
        console.error('Error fetching growth data:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [plantId]);

  return { data, isLoading, isError };
} 