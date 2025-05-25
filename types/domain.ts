// Growth Stage Enum
export const growthStageEnum = {
    SEED: 'seed',
    GERMINATION: 'germination',
    SEEDLING: 'seedling',
    VEGETATIVE: 'vegetative',
    FLOWERING: 'flowering',
    FRUITING: 'fruiting',
    HARVEST: 'harvest'
} as const;

export type GrowthStage = typeof growthStageEnum[keyof typeof growthStageEnum];

// Plant Categories
export const plantCategoryEnum = {
    VEGETABLE: 'vegetable',
    HERB: 'herb',
    FLOWER: 'flower',
    FRUIT: 'fruit',
    OTHER: 'other'
} as const;

export type PlantCategory = typeof plantCategoryEnum[keyof typeof plantCategoryEnum];

// Light Requirements
export const lightRequirementEnum = {
    FULL_SUN: 'full_sun',
    PARTIAL_SUN: 'partial_sun',
    SHADE: 'shade'
} as const;

export type LightRequirement = typeof lightRequirementEnum[keyof typeof lightRequirementEnum];

// Health Status
export const healthStatusEnum = {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    CRITICAL: 'critical'
} as const;

export type HealthStatus = typeof healthStatusEnum[keyof typeof healthStatusEnum];

// Alert Types
export const alertTypeEnum = {
    PEST_RISK: 'pest_risk',
    DEFICIENCY: 'deficiency',
    DISEASE: 'disease',
    ENVIRONMENTAL: 'environmental',
    OTHER: 'other'
} as const;

export type AlertType = typeof alertTypeEnum[keyof typeof alertTypeEnum];

// Alert Severity
export const alertSeverityEnum = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
} as const;

export type AlertSeverity = typeof alertSeverityEnum[keyof typeof alertSeverityEnum];

// Base Interfaces
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface UserEntity extends BaseEntity {
    user_id: string;
}

// Domain Models
export interface SeedType extends BaseEntity {
    name: string;
    scientific_name?: string;
    family?: string;
    category: PlantCategory;
    germination_days_min?: number;
    germination_days_max?: number;
    harvest_days_min?: number;
    harvest_days_max?: number;
    optimal_temperature_min?: number;
    optimal_temperature_max?: number;
    optimal_ph_min?: number;
    optimal_ph_max?: number;
    light_requirements: LightRequirement;
    created_by?: string;
    is_verified: boolean;
}

export interface SeedInstance extends UserEntity {
    seed_type_id: string;
    batch_code?: string;
    purchase_date?: string;
    expiry_date?: string;
    storage_location?: string;
    quantity?: number;
    notes?: string;
}

export interface GrowthStageEntity extends BaseEntity {
    seed_type_id: string;
    name: string;
    description?: string;
    duration_days_min?: number;
    duration_days_max?: number;
    order_index: number;
    stage: GrowthStage;
}

export interface GrowthLog extends UserEntity {
    seed_instance_id: string;
    growth_stage_id: string;
    log_date: string;
    height?: number;
    leaf_count?: number;
    node_count?: number;
    health_status: HealthStatus;
    notes?: string;
    photo_url?: string;
}

export interface GrowthAlert extends UserEntity {
    growth_log_id: string;
    alert_type: AlertType;
    severity: AlertSeverity;
    message: string;
    is_resolved: boolean;
    resolved_at?: string;
}

// Extended Interfaces for Detailed Views
export interface SeedInstanceWithDetails extends SeedInstance {
    seed_type: SeedType;
    current_growth_stage?: GrowthStageEntity;
    latest_log?: GrowthLog;
    active_alerts?: GrowthAlert[];
}

export interface GrowthStageWithDetails extends GrowthStageEntity {
    guides: GrowthGuide[];
    nutrients: StageNutrients;
    logs: GrowthLog[];
}

export interface GrowthLogWithDetails extends GrowthLog {
    seed_instance: SeedInstance;
    growth_stage: GrowthStageEntity;
    alerts: GrowthAlert[];
}

// Additional Types
export interface GrowthGuide extends BaseEntity {
    growth_stage_id: string;
    title: string;
    content: string;
    image_url?: string;
    video_url?: string;
}

export interface StageNutrients extends BaseEntity {
    growth_stage_id: string;
    nitrogen_level?: number;
    phosphorus_level?: number;
    potassium_level?: number;
    calcium_level?: number;
    magnesium_level?: number;
    notes?: string;
}

// App-specific types
export interface SeedFormData {
    name: string;
    species: string;
    variety?: string;
    plantedDate: Date | string;
    imageUrl?: string;
    notes?: string;
}

export interface PlantLog {
    id: string;
    seedId: string;
    logType: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'other';
    notes?: string;
    imageUrl?: string;
    createdAt: Date | string;
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
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Create an index file to re-export everything
export * from './hydroponic';
export * from './journal';
export * from './errors'; 