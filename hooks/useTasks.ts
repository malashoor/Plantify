import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Task = {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type UseTasksResult = {
  data: Task[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export const useTasks = (): UseTasksResult => {
  const [data, setData] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: tasks, error: supabaseError } = await supabase
        .from('tasks')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setData(tasks as Task[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTasks,
  };
}; 