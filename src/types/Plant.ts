export interface Plant {
  id: string;
  name: string;
  image: any; // TODO: Type this properly based on your image asset handling
  description: string;
  care: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  speciesId?: string;
  wateringSchedule?: {
    frequency: number; // days between waterings
    lastWatered?: string; // ISO date string
    nextWatering?: string; // ISO date string
  };
  healthStatus?: {
    lastCheck: string; // ISO date string
    status: 'healthy' | 'needsAttention' | 'critical';
    issues?: string[];
  };
  location?: {
    indoor: boolean;
    lightLevel: 'low' | 'medium' | 'high';
    room?: string;
  };
}
