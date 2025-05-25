import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { PlantCarePlan, UsePlantCareResult } from '@/types/plant-care';

export const usePlantCare = (plantId: string): UsePlantCareResult => {
  const [data, setData] = useState<PlantCarePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCarePlan = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: carePlan, error: supabaseError } = await supabase
        .from('plant_care')
        .select(`
          id,
          plant_id,
          watering_interval_days,
          feeding_recipe,
          pruning_schedule,
          last_updated,
          created_at,
          updated_at
        `)
        .eq('plant_id', plantId)
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Transform the data to match our type
      const transformedCarePlan: PlantCarePlan = {
        id: carePlan.id,
        plantId: carePlan.plant_id,
        wateringIntervalDays: carePlan.watering_interval_days,
        feedingRecipe: carePlan.feeding_recipe,
        pruningSchedule: carePlan.pruning_schedule,
        lastUpdated: carePlan.last_updated,
        createdAt: carePlan.created_at,
        updatedAt: carePlan.updated_at,
      };

      setData(transformedCarePlan);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch plant care plan'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlan();
  }, [plantId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchCarePlan,
  };
}; 