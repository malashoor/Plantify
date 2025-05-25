import { PostgrestError } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Type-safe Supabase query hook
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
) {
  const { data, error } = await queryFn();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No data returned from query');
  }

  return data;
}

// Type-safe Supabase mutation hook
export async function supabaseMutation<T>(
  mutationFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
) {
  const { data, error } = await mutationFn();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No data returned from mutation');
  }

  return data;
}

// Development tools configuration
export const devToolsConfig = {
  enabled: process.env.NODE_ENV === 'development',
  position: 'bottom-right',
} as const;
