import { useState, useCallback } from 'react';

import { supabase } from '../lib/supabase';
import { Seed, SeedFormData, GrowthStage } from '../types/seed';

import { useToast } from './useToast';

export const useSeeds = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchSeeds = useCallback(async (): Promise<Seed[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('seeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data.map(
        (seed: {
          id: string;
          name: string;
          species: string;
          variety?: string;
          planted_date: string;
          last_updated: string;
          created_at: string;
          updated_at: string;
          image_url?: string;
          notes?: string;
          current_stage?: string;
        }) => ({
          ...seed,
          plantedDate: new Date(seed.planted_date),
          lastUpdated: new Date(seed.last_updated),
          createdAt: new Date(seed.created_at),
          updatedAt: new Date(seed.updated_at),
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch seeds';
      setError(message);
      showToast('error', message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createSeed = useCallback(
    async (formData: SeedFormData): Promise<Seed | null> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: createError } = await supabase
          .from('seeds')
          .insert([
            {
              name: formData.name,
              species: formData.species,
              variety: formData.variety,
              planted_date: formData.plantedDate.toISOString(),
              image_url: formData.imageUrl,
              notes: formData.notes,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        return {
          ...data,
          plantedDate: new Date(data.planted_date),
          lastUpdated: new Date(data.last_updated),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create seed';
        setError(message);
        showToast('error', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const updateSeedStage = useCallback(
    async (seedId: string, newStage: GrowthStage, notes?: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // Start a transaction
        const { error: updateError } = await supabase
          .from('seeds')
          .update({
            current_stage: newStage,
            last_updated: new Date().toISOString(),
          })
          .eq('id', seedId);

        if (updateError) throw updateError;

        // Record the stage change
        const { error: stageError } = await supabase.from('growth_stages').insert([
          {
            seed_id: seedId,
            stage: newStage,
            notes,
          },
        ]);

        if (stageError) throw stageError;

        showToast('success', 'Growth stage updated successfully');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update growth stage';
        setError(message);
        showToast('error', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const deleteSeed = useCallback(
    async (seedId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase.from('seeds').delete().eq('id', seedId);

        if (deleteError) throw deleteError;

        showToast('success', 'Seed deleted successfully');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete seed';
        setError(message);
        showToast('error', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return {
    loading,
    error,
    fetchSeeds,
    createSeed,
    updateSeedStage,
    deleteSeed,
  };
};
