export interface PlantCarePlan {
  id: string;
  plantId: string;
  wateringIntervalDays: number;
  feedingRecipe: {
    nutrient: string;
    ppm: number;
  }[];
  pruningSchedule: {
    month: number;
    day: number;
  }[];
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsePlantCareResult {
  data: PlantCarePlan | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 