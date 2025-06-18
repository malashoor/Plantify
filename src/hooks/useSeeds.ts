import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';

interface Seed {
  id: string;
  name: string;
  type: string;
  optimal_temperature: number;
  optimal_humidity: number;
  planting_depth: number;
  days_to_germination: number;
  days_to_maturity: number;
  spacing: number;
  light_requirement: 'full_sun' | 'partial_shade' | 'full_shade';
  water_requirement: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const useSeeds = () => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('seeds')
        .select('*')
        .order('name');

      if (supabaseError) throw new Error(supabaseError.message);
      
      setSeeds(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seeds data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeeds();
  }, []);

  return {
    seeds,
    loading,
    error,
    refetch: fetchSeeds,
  };
}; 