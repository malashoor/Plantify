import { useState, useEffect } from 'react';

export interface WateringGuide {
  plantId: string;
  schedule: string; // e.g., "Every 3 days"
  lastWatered: string; // ISO date
  plantName?: string;
  waterAmount?: string;
  notes?: string;
}

export function useWateringGuides(plantId?: string) {
  const [guides, setGuides] = useState<WateringGuide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockGuides: WateringGuide[] = [
    {
      plantId: 'plant-1',
      plantName: 'Fiddle Leaf Fig',
      schedule: 'Every 7 days',
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      waterAmount: '200ml',
      notes: 'Water when top inch of soil is dry'
    },
    {
      plantId: 'plant-2',
      plantName: 'Snake Plant',
      schedule: 'Every 14 days',
      lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      waterAmount: '150ml',
      notes: 'Very drought tolerant, less is more'
    },
    {
      plantId: 'plant-3',
      plantName: 'Pothos',
      schedule: 'Every 5 days',
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      waterAmount: '180ml',
      notes: 'Likes consistent moisture'
    }
  ];

  const fetchWateringGuides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with real Supabase/API call
      // const { data, error } = await supabase
      //   .from('watering_guides')
      //   .select('*')
      //   .eq(plantId ? 'plant_id' : '', plantId || '');

      let filteredGuides = mockGuides;
      if (plantId) {
        filteredGuides = mockGuides.filter(guide => guide.plantId === plantId);
      }

      setGuides(filteredGuides);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch watering guides');
      setIsLoading(false);
      console.error('Error fetching watering guides:', err);
    }
  };

  const updateLastWatered = async (plantId: string, date: string = new Date().toISOString()) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Supabase/API call
      // await supabase
      //   .from('watering_guides')
      //   .update({ last_watered: date })
      //   .eq('plant_id', plantId);

      setGuides(prev => prev.map(guide => 
        guide.plantId === plantId 
          ? { ...guide, lastWatered: date }
          : guide
      ));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update watering record');
      setIsLoading(false);
      console.error('Error updating watering record:', err);
    }
  };

  useEffect(() => {
    fetchWateringGuides();
  }, [plantId]);

  return {
    guides,
    isLoading,
    error,
    refetch: fetchWateringGuides,
    updateLastWatered
  };
} 