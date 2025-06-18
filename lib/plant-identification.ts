import * as ImageManipulator from 'expo-image-manipulator';

import { Platform } from 'react-native';

// Types
export interface IdentificationResult {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  probability: number;
  imageUrl: string;
  timestamp: string;
}

export interface PlantDetails {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  description: string;
  careInstructions: {
    watering: string;
    sunlight: string;
    soil: string;
    temperature: string;
    humidity: string;
  };
  diseases: Array<{
    name: string;
    description: string;
    treatment: string;
  }>;
}

// Identify plant from image
export async function identifyPlant(
  imageUri: string,
): Promise<IdentificationResult> {
  // Simulated identification result
  return {
    id: `plant-${Date.now()}`,
    scientificName: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    family: 'Araceae',
    probability: 0.95,
    imageUrl: imageUri,
    timestamp: new Date().toISOString(),
  };
}

// Get plant details
export async function getPlantDetails(plantId: string): Promise<PlantDetails> {
  // Simulated plant details
  return {
    id: plantId,
    scientificName: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    family: 'Araceae',
    description:
      'A popular tropical plant known for its large, perforated leaves.',
    careInstructions: {
      watering: 'Water when top soil is dry',
      sunlight: 'Bright indirect light',
      soil: 'Well-draining potting mix',
      temperature: '65-85°F (18-29°C)',
      humidity: 'High humidity preferred',
    },
    diseases: [
      {
        name: 'Leaf Spot',
        description: 'Brown spots on leaves',
        treatment: 'Remove affected leaves and improve air circulation',
      },
    ],
  };
}
