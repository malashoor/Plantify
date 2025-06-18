import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Emotion } from '../services/EmotionService';

interface UseEmotionsOptions {
  userId: string;
  days?: number;
  onError?: (error: Error) => void;
}

interface UseEmotionsState {
  emotions: Emotion[];
  isLoading: boolean;
  error: Error | null;
}

export function useEmotions({ userId, days = 7, onError }: UseEmotionsOptions) {
  const [state, setState] = useState<UseEmotionsState>({
    emotions: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchEmotions() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
          .from('user_emotions')
          .select('*')
          .eq('user_id', userId)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: true });

        if (error) throw error;

        const emotions = data.map(row => ({
          type: row.emotion_type,
          intensity: row.intensity,
          timestamp: row.timestamp,
          context: row.context || undefined,
        })) as Emotion[];

        setState(prev => ({ ...prev, emotions, isLoading: false }));
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to fetch emotions');
        setState(prev => ({ ...prev, error: err, isLoading: false }));
        onError?.(err);
      }
    }

    fetchEmotions();
  }, [userId, days, onError]);

  return state;
}
