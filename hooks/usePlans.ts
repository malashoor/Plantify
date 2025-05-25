import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  features: string[];
  is_popular: boolean;
  period: 'month' | 'year';
  sort_order: number;
}

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching plans:', error);
        throw new Error('Failed to fetch plans');
      }
      
      return data || [];
    },
  });
}

// Fallback static plans if Supabase fetch fails
export const FALLBACK_PLANS: Plan[] = [
  {
    id: 'hobbyist',
    name: 'Hobbyist',
    description: 'Perfect for hobby gardeners and plant enthusiasts',
    price: 4.99,
    price_id: 'price_hobbyist',
    features: [
      'Up to 20 plants',
      'Basic care reminders',
      'Plant identification',
      'Watering scheduler'
    ],
    is_popular: false,
    period: 'month',
    sort_order: 1
  },
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'Ideal for serious gardeners and small businesses',
    price: 19.99,
    price_id: 'price_commercial',
    features: [
      'Up to 100 plants',
      'Advanced care analytics',
      'Disease identification',
      'Growth tracking',
      'Unlimited care reminders',
      'Weather integration'
    ],
    is_popular: true,
    period: 'month',
    sort_order: 2
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For professional landscapers and commercial gardens',
    price: 49.99,
    price_id: 'price_enterprise',
    features: [
      'Unlimited plants',
      'Team collaboration',
      'API access',
      'Custom analytics',
      'Priority support',
      'Soil analysis integration',
      'Advanced reporting'
    ],
    is_popular: false,
    period: 'month',
    sort_order: 3
  }
]; 