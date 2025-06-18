import { useState, useEffect } from 'react';

export interface FertilizationGuide {
  plantId: string;
  fertilizerType: string;
  frequency: string;
  nextFertilization: string; // ISO date
  plantName?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  dosage?: string;
  lastFertilized?: string; // ISO date
  notes?: string;
}

export function useFertilizationGuides(plantId?: string) {
  const [guides, setGuides] = useState<FertilizationGuide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockGuides: FertilizationGuide[] = [
    {
      plantId: 'plant-1',
      plantName: 'Fiddle Leaf Fig',
      fertilizerType: 'Balanced liquid fertilizer (10-10-10)',
      frequency: 'Every 2 weeks',
      nextFertilization: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastFertilized: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      season: 'spring',
      dosage: '1/4 strength',
      notes: 'Reduce to monthly in winter'
    },
    {
      plantId: 'plant-2',
      plantName: 'Snake Plant',
      fertilizerType: 'Succulent fertilizer',
      frequency: 'Monthly',
      nextFertilization: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastFertilized: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      season: 'spring',
      dosage: 'Half strength',
      notes: 'Skip fertilizing in winter months'
    },
    {
      plantId: 'plant-3',
      plantName: 'Pothos',
      fertilizerType: 'General houseplant fertilizer',
      frequency: 'Every 3 weeks',
      nextFertilization: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      lastFertilized: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      season: 'spring',
      dosage: '1/2 strength',
      notes: 'Very forgiving with fertilizer schedule'
    }
  ];

  const fetchFertilizationGuides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 900));

      // TODO: Replace with real Supabase/API call
      // const { data, error } = await supabase
      //   .from('fertilization_guides')
      //   .select('*')
      //   .eq(plantId ? 'plant_id' : '', plantId || '');

      let filteredGuides = mockGuides;
      if (plantId) {
        filteredGuides = mockGuides.filter(guide => guide.plantId === plantId);
      }

      setGuides(filteredGuides);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch fertilization guides');
      setIsLoading(false);
      console.error('Error fetching fertilization guides:', err);
    }
  };

  const updateLastFertilized = async (plantId: string, date: string = new Date().toISOString()) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Supabase/API call
      // await supabase
      //   .from('fertilization_guides')
      //   .update({ last_fertilized: date })
      //   .eq('plant_id', plantId);

      setGuides(prev => prev.map(guide => {
        if (guide.plantId === plantId) {
          // Calculate next fertilization based on frequency
          const frequencyDays = guide.frequency.includes('week') 
            ? parseInt(guide.frequency) * 7 || 14
            : parseInt(guide.frequency) * 30 || 30;
          
          const nextDate = new Date(Date.now() + frequencyDays * 24 * 60 * 60 * 1000).toISOString();
          
          return {
            ...guide,
            lastFertilized: date,
            nextFertilization: nextDate
          };
        }
        return guide;
      }));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update fertilization record');
      setIsLoading(false);
      console.error('Error updating fertilization record:', err);
    }
  };

  const updateFertilizationSchedule = async (
    plantId: string, 
    updates: Partial<Pick<FertilizationGuide, 'fertilizerType' | 'frequency' | 'dosage' | 'notes'>>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Supabase/API call
      // await supabase
      //   .from('fertilization_guides')
      //   .update(updates)
      //   .eq('plant_id', plantId);

      setGuides(prev => prev.map(guide => 
        guide.plantId === plantId 
          ? { ...guide, ...updates }
          : guide
      ));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update fertilization schedule');
      setIsLoading(false);
      console.error('Error updating fertilization schedule:', err);
    }
  };

  useEffect(() => {
    fetchFertilizationGuides();
  }, [plantId]);

  return {
    guides,
    isLoading,
    error,
    refetch: fetchFertilizationGuides,
    updateLastFertilized,
    updateFertilizationSchedule
  };
} 