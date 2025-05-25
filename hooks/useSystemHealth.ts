import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type HealthItem = {
  id: string;
  title: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
};

export type UseSystemHealthResult = {
  data: HealthItem[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export const useSystemHealth = (): UseSystemHealthResult => {
  const [data, setData] = useState<HealthItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: healthData, error: supabaseError } = await supabase
        .from('system_health')
        .select('*')
        .order('last_checked', { ascending: false })
        .limit(5);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setData(healthData as HealthItem[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch system health'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchHealth,
  };
}; 