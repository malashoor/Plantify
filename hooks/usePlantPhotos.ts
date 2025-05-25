import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type PlantPhoto = {
  id: string;
  plantId: string;
  plantName: string;
  imageUrl: string;
  takenAt: string;
  createdAt: string;
  updatedAt: string;
};

type PlantPhotoWithRelations = {
  id: string;
  plant_id: string;
  image_url: string;
  taken_at: string;
  created_at: string;
  updated_at: string;
  plants: {
    name: string;
  };
};

export type UsePlantPhotosResult = {
  data: PlantPhoto[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export const usePlantPhotos = (): UsePlantPhotosResult => {
  const [data, setData] = useState<PlantPhoto[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: photos, error: supabaseError } = await supabase
        .from('plant_photos')
        .select(`
          id,
          plant_id,
          image_url,
          taken_at,
          created_at,
          updated_at,
          plants (
            name
          )
        `)
        .order('taken_at', { ascending: false })
        .limit(5);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Transform the data to match our type
      const transformedPhotos = (photos as PlantPhotoWithRelations[]).map(photo => ({
        id: photo.id,
        plantId: photo.plant_id,
        plantName: photo.plants.name,
        imageUrl: photo.image_url,
        takenAt: photo.taken_at,
        createdAt: photo.created_at,
        updatedAt: photo.updated_at,
      }));

      setData(transformedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch plant photos'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPhotos,
  };
}; 