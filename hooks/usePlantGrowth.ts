import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { GrowthRecord, UsePlantGrowthResult } from '@/types/plant-growth';

export const usePlantGrowth = (plantId: string): UsePlantGrowthResult => {
  const [data, setData] = useState<GrowthRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGrowthRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: records, error: supabaseError } = await supabase
        .from('plant_growth')
        .select(`
          id,
          plant_id,
          date,
          height_cm,
          leaf_count,
          notes,
          created_at,
          updated_at
        `)
        .eq('plant_id', plantId)
        .order('date', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Transform the data to match our type
      const transformedRecords: GrowthRecord[] = records.map(record => ({
        id: record.id,
        plantId: record.plant_id,
        date: record.date,
        heightCm: record.height_cm,
        leafCount: record.leaf_count,
        notes: record.notes,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      }));

      setData(transformedRecords);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch growth records'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthRecords();
  }, [plantId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchGrowthRecords,
  };
}; 