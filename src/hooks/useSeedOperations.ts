import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreateSeedInput, UpdateSeedInput, Seed } from '../types/seed';
import { useTranslation } from 'react-i18next';

export function useSeedOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const createSeed = async (input: CreateSeedInput): Promise<Seed> => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(t('errors.auth.not_authenticated'));
      }

      const { data, error } = await supabase
        .from('seeds')
        .insert({
          user_id: user.id,
          name: input.name,
          species: input.species,
          environment: input.environment,
          notes: input.notes,
          latitude: input.latitude,
          longitude: input.longitude,
          city: input.city,
          country: input.country,
          planted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error(t('errors.seeds.creation_failed'));

      return data as Seed;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSeed = async (id: string, input: UpdateSeedInput): Promise<Seed> => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(t('errors.auth.not_authenticated'));
      }

      const { data, error } = await supabase
        .from('seeds')
        .update({
          name: input.name,
          species: input.species,
          environment: input.environment,
          notes: input.notes,
          latitude: input.latitude,
          longitude: input.longitude,
          city: input.city,
          country: input.country,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error(t('errors.seeds.update_failed'));

      return data as Seed;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSeed = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(t('errors.auth.not_authenticated'));
      }

      const { error } = await supabase.from('seeds').delete().eq('id', id).eq('user_id', user.id);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSeed,
    updateSeed,
    deleteSeed,
    isLoading,
  };
}
