import { useState, useEffect } from 'react';

export interface GrowthDataPoint {
  date: string; // ISO date
  height: number; // cm
  notes?: string;
  health?: 'excellent' | 'good' | 'fair' | 'poor';
  leafCount?: number;
  imageUrl?: string;
}

export interface GrowthData {
  plantId: string;
  plantName?: string;
  data: GrowthDataPoint[];
  startDate?: string;
  currentHeight?: number;
  growthRate?: number; // cm per month
}

export function useGrowthData(plantId?: string) {
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockGrowthData: GrowthData[] = [
    {
      plantId: 'plant-1',
      plantName: 'Fiddle Leaf Fig',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      currentHeight: 125,
      growthRate: 2.5,
      data: [
        {
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          height: 115,
          health: 'good',
          leafCount: 12,
          notes: 'Initial measurement when purchased',
        },
        {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          height: 118,
          health: 'good',
          leafCount: 14,
          notes: 'New leaf growth visible',
        },
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          height: 122,
          health: 'excellent',
          leafCount: 16,
          notes: 'Responding well to fertilizer',
        },
        {
          date: new Date().toISOString(),
          height: 125,
          health: 'excellent',
          leafCount: 18,
          notes: 'Consistent growth, very healthy',
        },
      ],
    },
    {
      plantId: 'plant-2',
      plantName: 'Snake Plant',
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      currentHeight: 65,
      growthRate: 0.8,
      data: [
        {
          date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          height: 60,
          health: 'good',
          leafCount: 8,
          notes: 'Healthy when received',
        },
        {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          height: 63,
          health: 'good',
          leafCount: 9,
          notes: 'Slow but steady growth',
        },
        {
          date: new Date().toISOString(),
          height: 65,
          health: 'excellent',
          leafCount: 10,
          notes: 'New shoot emerging',
        },
      ],
    },
    {
      plantId: 'plant-3',
      plantName: 'Pothos',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      currentHeight: 45,
      growthRate: 4.2,
      data: [
        {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          height: 35,
          health: 'good',
          leafCount: 15,
          notes: 'Small cutting, starting to establish',
        },
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          height: 40,
          health: 'excellent',
          leafCount: 22,
          notes: 'Rapid vine growth',
        },
        {
          date: new Date().toISOString(),
          height: 45,
          health: 'excellent',
          leafCount: 28,
          notes: 'Very fast grower, may need pruning soon',
        },
      ],
    },
  ];

  const fetchGrowthData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));

      // TODO: Replace with real Supabase/API call
      // const { data, error } = await supabase
      //   .from('growth_data')
      //   .select('*')
      //   .eq(plantId ? 'plant_id' : '', plantId || '')
      //   .order('created_at', { ascending: true });

      let filteredData = mockGrowthData;
      if (plantId) {
        filteredData = mockGrowthData.filter(data => data.plantId === plantId);
      }

      setGrowthData(filteredData);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch growth data');
      setIsLoading(false);
      console.error('Error fetching growth data:', err);
    }
  };

  const addGrowthMeasurement = async (
    plantId: string,
    measurement: Omit<GrowthDataPoint, 'date'>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Supabase/API call
      // await supabase
      //   .from('growth_measurements')
      //   .insert([{ ...measurement, plant_id: plantId, date: new Date().toISOString() }]);

      const newMeasurement: GrowthDataPoint = {
        ...measurement,
        date: new Date().toISOString(),
      };

      setGrowthData(prev =>
        prev.map(data => {
          if (data.plantId === plantId) {
            const updatedData = [...data.data, newMeasurement].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            // Calculate new growth rate
            const firstPoint = updatedData[0];
            const lastPoint = updatedData[updatedData.length - 1];
            const daysDiff =
              (new Date(lastPoint.date).getTime() - new Date(firstPoint.date).getTime()) /
              (1000 * 60 * 60 * 24);
            const heightDiff = lastPoint.height - firstPoint.height;
            const growthRate = daysDiff > 0 ? (heightDiff / daysDiff) * 30 : 0; // cm per month

            return {
              ...data,
              data: updatedData,
              currentHeight: measurement.height,
              growthRate: Math.round(growthRate * 10) / 10,
            };
          }
          return data;
        })
      );

      setIsLoading(false);
    } catch (err) {
      setError('Failed to add growth measurement');
      setIsLoading(false);
      console.error('Error adding growth measurement:', err);
    }
  };

  const getGrowthStats = (plantId: string) => {
    const plantData = growthData.find(data => data.plantId === plantId);
    if (!plantData || plantData.data.length < 2) {
      return null;
    }

    const { data } = plantData;
    const totalGrowth = data[data.length - 1].height - data[0].height;
    const daysSinceStart =
      (new Date().getTime() - new Date(data[0].date).getTime()) / (1000 * 60 * 60 * 24);
    const averageGrowthPerDay = totalGrowth / daysSinceStart;
    const averageGrowthPerMonth = averageGrowthPerDay * 30;

    return {
      totalGrowth: Math.round(totalGrowth * 10) / 10,
      daysSinceStart: Math.round(daysSinceStart),
      averageGrowthPerMonth: Math.round(averageGrowthPerMonth * 10) / 10,
      measurementCount: data.length,
      currentHeight: data[data.length - 1].height,
      startHeight: data[0].height,
    };
  };

  useEffect(() => {
    fetchGrowthData();
  }, [plantId]);

  return {
    growthData,
    isLoading,
    error,
    refetch: fetchGrowthData,
    addGrowthMeasurement,
    getGrowthStats,
  };
}
