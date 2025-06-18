import { useState, useCallback } from 'react';

import { supabase } from '../lib/supabase';
import { SeedGuide, GrowthStage } from '../types/seed';

import { useToast } from './useToast';

export const useGrowthGuide = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchGuideBySpecies = useCallback(
    async (species: string, variety?: string): Promise<SeedGuide | null> => {
      try {
        setLoading(true);
        setError(null);

        const query = supabase.from('seed_guides').select('*').eq('species', species);

        if (variety) {
          query.eq('variety', variety);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError) throw fetchError;

        return {
          ...data,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch growth guide';
        setError(message);
        showToast('error', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const getStageInstructions = useCallback((guide: SeedGuide, stage: GrowthStage) => {
    return guide.stages[stage];
  }, []);

  const getNextStage = useCallback((currentStage: GrowthStage): GrowthStage | null => {
    const stages: GrowthStage[] = [
      'seed',
      'germination',
      'seedling',
      'vegetative',
      'flowering',
      'fruiting',
      'harvest',
    ];

    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }, []);

  const getStageDuration = useCallback((guide: SeedGuide, stage: GrowthStage): number => {
    return guide.stages[stage].duration;
  }, []);

  const getCareRequirements = useCallback((guide: SeedGuide, stage: GrowthStage) => {
    return guide.stages[stage].careRequirements;
  }, []);

  return {
    loading,
    error,
    fetchGuideBySpecies,
    getStageInstructions,
    getNextStage,
    getStageDuration,
    getCareRequirements,
  };
};
