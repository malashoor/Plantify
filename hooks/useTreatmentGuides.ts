import { useState, useEffect } from 'react';

export interface TreatmentGuide {
  plantId: string;
  issue: string;
  solution: string;
  severity: 'low' | 'medium' | 'high';
  treatmentType?: 'pest' | 'disease' | 'nutrient' | 'environmental';
  estimatedTime?: string;
  preventionTips?: string[];
}

export function useTreatmentGuides(plantId?: string) {
  const [guides, setGuides] = useState<TreatmentGuide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockGuides: TreatmentGuide[] = [
    {
      plantId: 'plant-1',
      issue: 'Yellow leaves',
      solution: 'Reduce watering frequency and check for root rot. Ensure proper drainage.',
      severity: 'medium',
      treatmentType: 'environmental',
      estimatedTime: '1-2 weeks',
      preventionTips: ['Check soil moisture before watering', 'Ensure pot has drainage holes']
    },
    {
      plantId: 'plant-2',
      issue: 'Spider mites',
      solution: 'Spray with neem oil solution weekly. Increase humidity around plant.',
      severity: 'high',
      treatmentType: 'pest',
      estimatedTime: '2-3 weeks',
      preventionTips: ['Maintain higher humidity', 'Regular inspection of leaf undersides']
    },
    {
      plantId: 'plant-3',
      issue: 'Brown leaf tips',
      solution: 'Switch to distilled water and increase humidity. Trim affected leaves.',
      severity: 'low',
      treatmentType: 'environmental',
      estimatedTime: '1 week',
      preventionTips: ['Use filtered or distilled water', 'Group plants together for humidity']
    },
    {
      plantId: 'plant-1',
      issue: 'Aphids',
      solution: 'Wash leaves with mild soap solution. Apply insecticidal soap if needed.',
      severity: 'medium',
      treatmentType: 'pest',
      estimatedTime: '1-2 weeks',
      preventionTips: ['Regular leaf cleaning', 'Inspect new plants before bringing indoors']
    }
  ];

  const fetchTreatmentGuides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Replace with real Supabase/API call
      // const { data, error } = await supabase
      //   .from('treatment_guides')
      //   .select('*')
      //   .eq(plantId ? 'plant_id' : '', plantId || '');

      let filteredGuides = mockGuides;
      if (plantId) {
        filteredGuides = mockGuides.filter(guide => guide.plantId === plantId);
      }

      setGuides(filteredGuides);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch treatment guides');
      setIsLoading(false);
      console.error('Error fetching treatment guides:', err);
    }
  };

  const addTreatmentRecord = async (treatment: Omit<TreatmentGuide, 'plantId'>, plantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Supabase/API call
      // await supabase
      //   .from('treatment_guides')
      //   .insert([{ ...treatment, plant_id: plantId }]);

      const newTreatment: TreatmentGuide = {
        ...treatment,
        plantId
      };

      setGuides(prev => [newTreatment, ...prev]);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to add treatment record');
      setIsLoading(false);
      console.error('Error adding treatment record:', err);
    }
  };

  const markTreatmentCompleted = async (plantId: string, issue: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real Supabase/API call
      // await supabase
      //   .from('treatment_guides')
      //   .update({ completed: true })
      //   .eq('plant_id', plantId)
      //   .eq('issue', issue);

      setGuides(prev => prev.filter(guide => 
        !(guide.plantId === plantId && guide.issue === issue)
      ));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to mark treatment as completed');
      setIsLoading(false);
      console.error('Error marking treatment completed:', err);
    }
  };

  useEffect(() => {
    fetchTreatmentGuides();
  }, [plantId]);

  return {
    guides,
    isLoading,
    error,
    refetch: fetchTreatmentGuides,
    addTreatmentRecord,
    markTreatmentCompleted
  };
} 