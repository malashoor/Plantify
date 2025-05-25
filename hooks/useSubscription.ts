import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'trial';
  current_period_end: string;
  created_at: string;
  canceled_at?: string;
  stripe_subscription_id: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  amount_paid: number;
  invoice_pdf: string;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

export function useSubscription() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery<Subscription | null>({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        throw new Error('Failed to fetch subscription');
      }
      
      return data;
    },
    enabled: !!userId,
  });
}

export function useInvoices() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery<Invoice[]>({
    queryKey: ['invoices', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
        throw new Error('Failed to fetch invoices');
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!userId) throw new Error('User not authenticated');

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
    },
  });
} 