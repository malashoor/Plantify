export type PlantCategory = 'vegetable' | 'herb' | 'flower' | 'fruit' | 'other';
export type LightRequirement = 'full_sun' | 'partial_sun' | 'shade';
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type AlertType =
  | 'pest_risk'
  | 'deficiency'
  | 'disease'
  | 'environmental'
  | 'other';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SeedType {
  id: string;
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
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_verified: boolean;
}

export interface SeedInstance {
  id: string;
  user_id: string;
  seed_type_id: string;
  batch_code?: string;
  purchase_date?: string;
  expiry_date?: string;
  storage_location?: string;
  quantity?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthStage {
  id: string;
  seed_type_id: string;
  name: string;
  description?: string;
  duration_days_min?: number;
  duration_days_max?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GrowthGuide {
  id: string;
  growth_stage_id: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StageNutrients {
  id: string;
  growth_stage_id: string;
  nitrogen_level?: number;
  phosphorus_level?: number;
  potassium_level?: number;
  calcium_level?: number;
  magnesium_level?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthLog {
  id: string;
  seed_instance_id: string;
  growth_stage_id: string;
  log_date: string;
  height?: number;
  leaf_count?: number;
  node_count?: number;
  health_status: HealthStatus;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthAlert {
  id: string;
  growth_log_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

// Extended interfaces for detailed views
export interface SeedInstanceWithDetails extends SeedInstance {
  seed_type: SeedType;
  current_growth_stage?: GrowthStage;
  latest_log?: GrowthLog;
  active_alerts?: GrowthAlert[];
}

export interface GrowthStageWithDetails extends GrowthStage {
  guides: GrowthGuide[];
  nutrients: StageNutrients;
  logs: GrowthLog[];
}

export interface GrowthLogWithDetails extends GrowthLog {
  seed_instance: SeedInstance;
  growth_stage: GrowthStage;
  alerts: GrowthAlert[];
}
