import { useState, useCallback } from 'react';

import { supabase } from '../lib/supabase';

import { useToast } from './useToast';

export interface AnalysisResult {
  condition: string;
  confidence: number;
  recommendations: string[];
  scientificName?: string;
  commonName?: string;
}

export interface PlantAnalyzerState {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export const usePlantAnalyzer = () => {
  const [state, setState] = useState<PlantAnalyzerState>({
    loading: false,
    error: null,
    result: null,
  });
  const { showToast } = useToast();

  const analyzeImage = useCallback(
    async (imageUri: string): Promise<AnalysisResult | null> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Upload image to Supabase storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const filename = imageUri.split('/').pop() || 'plant-image.jpg';
        const filePath = `analysis/${Date.now()}_${filename}`;

        const { error: uploadError, data } = await supabase.storage
          .from('images')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('images').getPublicUrl(filePath);

        // Call Plant.id API
        const plantIdResponse = await fetch('https://api.plant.id/v2/identify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': process.env.PLANT_ID_API_KEY || '',
          },
          body: JSON.stringify({
            images: [publicUrl],
            plant_details: {
              common_names: true,
              scientific_name: true,
              disease: true,
              deficiency: true,
            },
          }),
        });

        if (!plantIdResponse.ok) {
          throw new Error('Failed to analyze plant health');
        }

        const plantData = await plantIdResponse.json();

        // Process and format the response
        const result: AnalysisResult = {
          condition: plantData.health_assessment?.disease || 'Healthy',
          confidence: plantData.health_assessment?.confidence || 0,
          recommendations: plantData.health_assessment?.recommendations || [],
          scientificName: plantData.scientific_name,
          commonName: plantData.common_names?.[0],
        };

        setState(prev => ({ ...prev, loading: false, result }));
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to analyze plant health';
        setState(prev => ({ ...prev, loading: false, error: message }));
        showToast('error', message);
        return null;
      }
    },
    [showToast]
  );

  const resetAnalysis = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    analyzeImage,
    resetAnalysis,
  };
};
