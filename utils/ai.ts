import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

import { Platform } from 'react-native';

// Types for AI responses
export interface PlantIdentification {
  scientificName: string;
  commonName: string;
  family: string;
  confidence: number;
  careInstructions: CareInstructions;
  diseases: Disease[];
  similarSpecies: SimilarSpecies[];
}

export interface SimilarSpecies {
  scientificName: string;
  commonName: string;
  confidence: number;
}

export interface CareInstructions {
  watering: string;
  sunlight: string;
  temperature: string;
  humidity: string;
  soil: string;
  fertilizer: string;
}

export interface Disease {
  name: string;
  probability: number;
  description: string;
  treatment: string;
}

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 100,
};

// Image preprocessing for optimal AI analysis
export async function preprocessImage(imageUri: string): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      return imageUri;
    }

    // Enhanced image preprocessing
    const processedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        { resize: { width: 1024, height: 1024 } },
        { normalize: true },
        { contrast: 1.1 }, // Slightly enhance contrast
        { brightness: 1.05 }, // Slightly enhance brightness
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );

    return processedImage.uri;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return imageUri;
  }
}

// Cache management
async function getCachedIdentification(
  imageHash: string,
): Promise<PlantIdentification | null> {
  try {
    const cached = await AsyncStorage.getItem(`plant_id_${imageHash}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_CONFIG.maxAge) {
      await AsyncStorage.removeItem(`plant_id_${imageHash}`);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

async function cacheIdentification(
  imageHash: string,
  result: PlantIdentification,
): Promise<void> {
  try {
    // Clean old cache entries if needed
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith('plant_id_'));
    if (cacheKeys.length >= CACHE_CONFIG.maxEntries) {
      const oldestKey = cacheKeys[0];
      await AsyncStorage.removeItem(oldestKey);
    }

    // Cache new result
    await AsyncStorage.setItem(
      `plant_id_${imageHash}`,
      JSON.stringify({
        data: result,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error('Error caching identification:', error);
  }
}

// Image hash generation
async function generateImageHash(imageUri: string): Promise<string> {
  const str = `${imageUri}_${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Enhanced plant identification with validation
export async function identifyPlant(
  imageUri: string,
): Promise<PlantIdentification> {
  try {
    // Process and validate image
    const processedImageUri = await preprocessImage(imageUri);
    const imageHash = await generateImageHash(processedImageUri);

    // Check cache first
    const cached = await getCachedIdentification(imageHash);
    if (cached) return cached;

    // Multiple model inference for better accuracy
    const results = await Promise.all([
      primaryModelInference(processedImageUri),
      secondaryModelInference(processedImageUri),
    ]);

    // Ensemble results
    const finalResult = ensembleResults(results);

    // Cache result if confidence is high enough
    if (finalResult.confidence > 0.8) {
      await cacheIdentification(imageHash, finalResult);
    }

    return finalResult;
  } catch (error) {
    console.error('Error identifying plant:', error);
    throw new Error('Failed to identify plant');
  }
}

// Primary model inference
async function primaryModelInference(
  imageUri: string,
): Promise<PlantIdentification> {
  // Simulated primary model inference
  return {
    scientificName: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    family: 'Araceae',
    confidence: 0.95,
    similarSpecies: [
      {
        scientificName: 'Monstera adansonii',
        commonName: 'Monkey Mask',
        confidence: 0.82,
      },
    ],
    careInstructions: {
      watering: 'Water when top 2-3 inches of soil are dry',
      sunlight: 'Bright, indirect light',
      temperature: '65-85°F (18-29°C)',
      humidity: 'Above 60%',
      soil: 'Well-draining potting mix',
      fertilizer: 'Monthly during growing season',
    },
    diseases: [
      {
        name: 'Leaf Spot',
        probability: 0.15,
        description: 'Brown spots with yellow halos on leaves',
        treatment: 'Remove affected leaves and improve air circulation',
      },
    ],
  };
}

// Secondary model inference for validation
async function secondaryModelInference(
  imageUri: string,
): Promise<PlantIdentification> {
  // Simulated secondary model inference
  return {
    scientificName: 'Monstera deliciosa',
    commonName: 'Swiss Cheese Plant',
    family: 'Araceae',
    confidence: 0.92,
    similarSpecies: [
      {
        scientificName: 'Monstera adansonii',
        commonName: 'Monkey Mask',
        confidence: 0.78,
      },
    ],
    careInstructions: {
      watering: 'Water when soil is partially dry',
      sunlight: 'Indirect sunlight',
      temperature: '65-85°F (18-29°C)',
      humidity: 'High humidity',
      soil: 'Rich, well-draining mix',
      fertilizer: 'Regular feeding during growth',
    },
    diseases: [
      {
        name: 'Leaf Spot',
        probability: 0.12,
        description: 'Brown spots on leaves',
        treatment: 'Improve air circulation and reduce watering',
      },
    ],
  };
}

// Ensemble results from multiple models
function ensembleResults(results: PlantIdentification[]): PlantIdentification {
  // If models disagree significantly, use the one with higher confidence
  if (results[0].scientificName !== results[1].scientificName) {
    return results[0].confidence > results[1].confidence
      ? results[0]
      : results[1];
  }

  // Combine results for higher accuracy
  return {
    ...results[0],
    confidence: (results[0].confidence + results[1].confidence) / 2,
    diseases: combineDiseasePredictions(results),
    similarSpecies: combineSimilarSpecies(results),
  };
}

// Combine disease predictions from multiple models
function combineDiseasePredictions(results: PlantIdentification[]): Disease[] {
  const diseases = new Map<string, Disease>();

  results.forEach((result) => {
    result.diseases.forEach((disease) => {
      if (diseases.has(disease.name)) {
        const existing = diseases.get(disease.name)!;
        diseases.set(disease.name, {
          ...disease,
          probability: (existing.probability + disease.probability) / 2,
        });
      } else {
        diseases.set(disease.name, disease);
      }
    });
  });

  return Array.from(diseases.values()).sort(
    (a, b) => b.probability - a.probability,
  );
}

// Combine similar species predictions
function combineSimilarSpecies(
  results: PlantIdentification[],
): SimilarSpecies[] {
  const species = new Map<string, SimilarSpecies>();

  results.forEach((result) => {
    result.similarSpecies.forEach((sp) => {
      if (species.has(sp.scientificName)) {
        const existing = species.get(sp.scientificName)!;
        species.set(sp.scientificName, {
          ...sp,
          confidence: (existing.confidence + sp.confidence) / 2,
        });
      } else {
        species.set(sp.scientificName, sp);
      }
    });
  });

  return Array.from(species.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3); // Keep top 3 similar species
}
