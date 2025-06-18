export interface Seed {
  id: string;
  name: string;
  type: string;
  plantingDate: string;
  expectedHarvestDate: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthStage {
  id: string;
  name: string;
  description: string;
  dayRange: {
    min: number;
    max: number;
  };
  tips: string[];
}

export interface SeedFormData {
  name: string;
  type: string;
  plantingDate: string;
  description?: string;
  imageUrl?: string;
}

export interface GrowthStageRecord {
  id: string;
  seedId: string;
  stage: GrowthStage;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface SeedGuide {
  id: string;
  species: string;
  variety?: string;
  stages: {
    [key in GrowthStage]: {
      duration: number; // in days
      instructions: string[];
      careRequirements: {
        water: string;
        light: string;
        temperature: string;
        humidity: string;
      };
    };
  };
  careInstructions: {
    general: string[];
    commonIssues: {
      issue: string;
      solution: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantLog {
  id: string;
  seedId: string;
  logType: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'other';
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
}
