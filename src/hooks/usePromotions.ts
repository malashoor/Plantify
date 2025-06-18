import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Promotion, UserPromotion, PromotionResult } from '../types/supabase';

export function useApplyPromotion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPromotion = useCallback(async (code: string): Promise<PromotionResult> => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'NOT_FOUND' };
      }

      // 1. Find the promotion by code
      const { data: promotion, error: findError } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code)
        .single();

      if (findError || !promotion) {
        return { success: false, error: 'INVALID_CODE' };
      }

      // 2. Check if expired
      if (promotion.expires_at && new Date(promotion.expires_at) < new Date()) {
        return { success: false, error: 'EXPIRED' };
      }

      // 3. Check if already applied
      const { data: existing } = await supabase
        .from('user_promotions')
        .select('*')
        .eq('promotion_id', promotion.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return { success: false, error: 'ALREADY_APPLIED' };
      }

      // 4. Apply the promotion
      const { error: applyError } = await supabase.from('user_promotions').insert({
        promotion_id: promotion.id,
        user_id: user.id,
      });

      if (applyError) {
        throw applyError;
      }

      return { success: true, promotion };
    } catch (err) {
      console.error('Error applying promotion:', err);
      return { success: false, error: 'NETWORK_ERROR' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { applyPromotion, loading, error };
}

export function useUserPromotions() {
  const [promotions, setPromotions] = useState<UserPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_promotions')
        .select(
          `
          *,
          promotion:promotions(*)
        `
        )
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      setPromotions(data || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper to check if user has active premium access
  const hasActivePremium = useCallback(() => {
    return promotions.some(up => {
      const promotion = up.promotion;
      if (!promotion) return false;

      return (
        promotion.type === 'premium_access' &&
        (!promotion.expires_at || new Date(promotion.expires_at) > new Date())
      );
    });
  }, [promotions]);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    hasActivePremium,
  };
}
