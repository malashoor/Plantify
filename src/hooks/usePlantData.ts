import { useEffect, useState } from 'react';
import { Plant } from '../types/Plant';
import { PlantService } from '../services/PlantService';

export function usePlantData(plantId: string | null) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState<boolean>(!!plantId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPlant() {
      if (!plantId) {
        setPlant(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await PlantService.getById(plantId);
        if (isMounted) {
          setPlant(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch plant data'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPlant();

    return () => {
      isMounted = false;
    };
  }, [plantId]);

  return { plant, loading, error };
} 