export type GrowthStage = 
    | 'seed'
    | 'germination'
    | 'seedling'
    | 'vegetative'
    | 'flowering'
    | 'fruiting'
    | 'harvest';

export interface Seed {
    id: string;
    userId: string;
    name: string;
    species: string;
    variety?: string;
    plantedDate: Date;
    currentStage: GrowthStage;
    lastUpdated: Date;
    imageUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
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

export interface SeedFormData {
    name: string;
    species: string;
    variety?: string;
    plantedDate: Date;
    imageUrl?: string;
    notes?: string;
} 