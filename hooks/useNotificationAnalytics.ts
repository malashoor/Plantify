import { useCallback } from 'react';

import { supabase } from '@/utils/supabase';
import { NotificationInteraction } from '@/utils/notifications';
import { useAuth } from './useAuth';

interface NotificationInteractionData {
  notificationId: string;
  action: NotificationInteraction;
  additionalData?: Record<string, any>;
}

export function useNotificationAnalytics() {
  const { user } = useAuth();

  /**
   * Track a notification interaction event
   */
  const trackInteraction = useCallback(async (
    data: NotificationInteractionData
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notification_interactions')
        .insert([
          {
            user_id: user?.id || 'anonymous',
            notification_id: data.notificationId,
            action: data.action,
            additional_data: data.additionalData || {},
            timestamp: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error tracking notification interaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error tracking notification interaction:', error);
      return false;
    }
  }, [user]);

  /**
   * Get notification interaction statistics for a user
   */
  const getInteractionStats = useCallback(async (
    userId?: string,
    dateRange?: { start: Date; end: Date }
  ) => {
    try {
      let query = supabase
        .from('notification_interactions')
        .select('action, count(*)')
        .eq('user_id', userId || user?.id)
        .groupBy('action');

      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start.toISOString())
          .lte('timestamp', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting notification stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return null;
    }
  }, [user]);

  /**
   * Get notification conversion rate (percentage of notifications that led to an action)
   */
  const getConversionRate = useCallback(async (
    dateRange?: { start: Date; end: Date }
  ): Promise<number | null> => {
    try {
      let query = supabase
        .from('notification_interactions')
        .select('action, count(*)')
        .eq('user_id', user?.id)
        .groupBy('action');

      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start.toISOString())
          .lte('timestamp', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error || !data) {
        return null;
      }

      // Count total interactions and "tap" actions
      const totalInteractions = data.reduce((sum, item) => sum + item.count, 0);
      const taps = data.find(item => item.action === NotificationInteraction.TAP)?.count || 0;
      
      // Avoid division by zero
      if (totalInteractions === 0) {
        return 0;
      }
      
      // Calculate conversion rate (taps / total interactions)
      return (taps / totalInteractions) * 100;
    } catch (error) {
      console.error('Error calculating conversion rate:', error);
      return null;
    }
  }, [user]);

  return {
    trackInteraction,
    getInteractionStats,
    getConversionRate,
  };
} 