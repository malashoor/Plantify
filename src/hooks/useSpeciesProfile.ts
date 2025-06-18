import { useEffect, useState } from 'react';
import type { SpeciesProfile } from '../types/species';
import { SpeciesProfileService } from '@services/SpeciesProfileService';

interface UseSpeciesProfileOptions {
  scientificName: string | null;
  includeEnvironmentData?: boolean;
  temperature?: number;
  humidity?: number;
  isIndoor?: boolean;
}

interface UseSpeciesProfileResult {
  profile: SpeciesProfile | null;
  loading: boolean;
  error: Error | null;
  wateringInterval: number | null;
  isDroughtTolerant: boolean;
  isMoistureLovingPlant: boolean;
}

export function useSpeciesProfile({
  scientificName,
  includeEnvironmentData = false,
  temperature,
  humidity,
  isIndoor,
}: UseSpeciesProfileOptions): UseSpeciesProfileResult {
  const [profile, setProfile] = useState<SpeciesProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!scientificName);
  const [error, setError] = useState<Error | null>(null);
  const [wateringInterval, setWateringInterval] = useState<number | null>(null);

  useEffect(() => {
    if (!scientificName) {
      setProfile(null);
      setLoading(false);
      setError(null);
      setWateringInterval(null);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const data = await SpeciesProfileService.getProfile(scientificName as string);
        setProfile(data);

        if (data && includeEnvironmentData && temperature !== undefined && humidity !== undefined && isIndoor !== undefined) {
          const interval = SpeciesProfileService.calculateWateringInterval(
            data,
            temperature,
            humidity,
            isIndoor
          );
          setWateringInterval(interval);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load species profile'));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [scientificName, includeEnvironmentData, temperature, humidity, isIndoor]);

  return {
    profile,
    loading,
    error,
    wateringInterval,
    isDroughtTolerant: profile ? SpeciesProfileService.isDroughtTolerant(profile) : false,
    isMoistureLovingPlant: profile ? SpeciesProfileService.isMoistureLovingPlant(profile) : false,
  };
} 