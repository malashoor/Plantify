export interface GrowthRecord {
  id: string;
  plantId: string;
  date: string;         // ISO date
  heightCm: number;
  leafCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsePlantGrowthResult {
  data: GrowthRecord[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 