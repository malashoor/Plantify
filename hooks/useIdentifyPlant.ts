import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';

export type PlantIdentification = {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  imageUrl: string;
  createdAt: string;
};

export type UseIdentifyPlantResult = {
  identifyPlant: (imageUri: string) => Promise<PlantIdentification>;
  isLoading: boolean;
  error: Error | null;
};

export const useIdentifyPlant = (): UseIdentifyPlantResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const identifyPlant = async (imageUri: string): Promise<PlantIdentification> => {
    try {
      setIsLoading(true);
      setError(null);

      // Read the image file
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      const fileContent = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to Uint8Array
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload image to Supabase Storage
      const fileName = `plant-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('plant-images')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('plant-images')
        .getPublicUrl(fileName);

      // Call plant identification API
      const { data: identification, error: apiError } = await supabase.functions
        .invoke('identify-plant', {
          body: { imageUrl: publicUrl },
        });

      if (apiError) {
        throw new Error(apiError.message);
      }

      return identification as PlantIdentification;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to identify plant');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    identifyPlant,
    isLoading,
    error,
  };
}; 