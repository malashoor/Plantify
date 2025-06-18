import { useState } from 'react';

export interface PlantAnalysis {
  id: string;
  plantName: string;
  confidence: number;
  description: string;
  careInstructions: string[];
  commonIssues: string[];
  imageUri?: string;
}

export function usePlantAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageUri: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate plant analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockAnalysis: PlantAnalysis = {
        id: Date.now().toString(),
        plantName: 'Common Houseplant',
        confidence: 0.85,
        description: 'This appears to be a healthy houseplant with broad green leaves.',
        careInstructions: [
          'Water when soil feels dry to touch',
          'Place in bright, indirect light',
          'Maintain humidity around 50-60%',
          'Fertilize monthly during growing season'
        ],
        commonIssues: [
          'Overwatering can cause root rot',
          'Brown leaf tips indicate low humidity',
          'Yellow leaves may signal overwatering or nutrient deficiency'
        ],
        imageUri
      };
      
      setResult(mockAnalysis);
      return mockAnalysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };

  return {
    loading,
    result,
    error,
    analyzeImage,
    resetAnalysis,
  };
} 