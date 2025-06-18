import { useEffect, useState } from 'react';
import { WeatherData } from '../services/WeatherService';
import { SpeciesProfile } from '../types/species';
import { SmartWateringService, WateringAdjustment } from '../services/SmartWateringService';
import { SpeciesProfileService } from '../services/SpeciesProfileService';
import { Seed } from '../types/seed';

interface UseWateringScheduleOptions {
  weather: WeatherData | null;
  profile: SpeciesProfile | null;
  isIndoor: boolean;
  lastWatered?: Date;
}

interface WateringSchedule {
  nextWateringDate: Date | null;
  daysUntilNextWatering: number | null;
  adjustment: WateringAdjustment | null;
  baseInterval: number | null;
}

export function useWateringSchedule({
  weather,
  profile,
  isIndoor,
  lastWatered = new Date(),
}: UseWateringScheduleOptions) {
  const [schedule, setSchedule] = useState<WateringSchedule>({
    nextWateringDate: null,
    daysUntilNextWatering: null,
    adjustment: null,
    baseInterval: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function calculateSchedule() {
      if (!weather || !profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate base interval using species profile
        const baseInterval = SpeciesProfileService.calculateWateringInterval(
          profile,
          weather.temperature,
          weather.humidity,
          isIndoor
        );

        // Calculate next watering date based on last watered date and base interval
        const baseNextWatering = new Date(lastWatered);
        baseNextWatering.setDate(baseNextWatering.getDate() + baseInterval);

        // Create a temporary seed object for smart watering evaluation
        const tempSeed: Seed = {
          id: `temp_${profile.id}`,
          user_id: 'system',
          name: profile.commonNames[0] || profile.scientificName,
          species: profile.scientificName,
          environment: isIndoor ? 'indoor' : 'outdoor',
          planted_at: lastWatered.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Get smart watering adjustments
        const adjustment = await SmartWateringService.evaluateWatering(
          tempSeed,
          weather,
          baseNextWatering
        );

        if (isMounted) {
          const now = new Date();
          const daysUntil = Math.ceil(
            (adjustment.nextWateringDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          setSchedule({
            nextWateringDate: adjustment.nextWateringDate,
            daysUntilNextWatering: daysUntil,
            adjustment,
            baseInterval,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to calculate watering schedule'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    calculateSchedule();

    return () => {
      isMounted = false;
    };
  }, [weather, profile, isIndoor, lastWatered]);

  return {
    schedule,
    loading,
    error,
    isAdjusted: schedule.adjustment?.shouldSkip || schedule.adjustment?.shouldIncrease || false,
  };
}
