import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type PlantTip = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};

export type UsePlantTipsResult = {
  data: PlantTip[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export const usePlantTips = (): UsePlantTipsResult => {
  const [data, setData] = useState<PlantTip[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTips = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: tips, error: supabaseError } = await supabase
        .from('plant_tips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setData(tips as PlantTip[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch plant tips'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTips,
  };
}; 