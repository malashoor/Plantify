// Types for hydroponic seed to harvest workflow

export type GerminationStatus = 'started' | 'sprouted' | 'failed' | 'transplanted';
export type PlantStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'harvest';

export interface Seed {
  id: string;
  name: string;
  scientific_name?: string;
  temp_min: number;
  temp_max: number;
  ph_min: number;
  ph_max: number;
  germ_days_min: number;
  germ_days_max: number;
  ec_min?: number;
  ec_max?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_public: boolean;
}

export interface GerminationLog {
  id: string;
  seed_id: string;
  date: string;
  status: GerminationStatus;
  notes?: string;
  photo_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlantStageLog {
  id: string;
  plant_id: string;
  stage: PlantStage;
  started_at: string;
  ended_at?: string;
  duration_days?: number;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Harvest {
  id: string;
  plant_id: string;
  harvest_date: string;
  weight_g: number;
  quality_rating?: number;
  notes?: string;
  photo_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content_md: string;
  tags: string[];
  author_id?: string;
  published_at?: string;
  is_published: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// Input types for creating/updating records

export interface CreateSeedInput {
  name: string;
  scientific_name?: string;
  temp_min: number;
  temp_max: number;
  ph_min: number;
  ph_max: number;
  germ_days_min: number;
  germ_days_max: number;
  ec_min?: number;
  ec_max?: number;
  notes?: string;
  is_public?: boolean;
}

export interface UpdateSeedInput {
  name?: string;
  scientific_name?: string;
  temp_min?: number;
  temp_max?: number;
  ph_min?: number;
  ph_max?: number;
  germ_days_min?: number;
  germ_days_max?: number;
  ec_min?: number;
  ec_max?: number;
  notes?: string;
  is_public?: boolean;
}

export interface CreateGerminationLogInput {
  seed_id: string;
  date?: string;
  status: GerminationStatus;
  notes?: string;
  photo_url?: string;
}

export interface UpdateGerminationLogInput {
  seed_id?: string;
  date?: string;
  status?: GerminationStatus;
  notes?: string;
  photo_url?: string;
}

export interface CreatePlantStageInput {
  plant_id: string;
  stage: PlantStage;
  started_at?: string;
  ended_at?: string;
  duration_days?: number;
  notes?: string;
}

export interface UpdatePlantStageInput {
  stage?: PlantStage;
  started_at?: string;
  ended_at?: string;
  duration_days?: number;
  notes?: string;
}

export interface CreateHarvestInput {
  plant_id: string;
  harvest_date?: string;
  weight_g: number;
  quality_rating?: number;
  notes?: string;
  photo_url?: string;
}

export interface UpdateHarvestInput {
  harvest_date?: string;
  weight_g?: number;
  quality_rating?: number;
  notes?: string;
  photo_url?: string;
}

export interface CreateArticleInput {
  title: string;
  content_md: string;
  tags: string[];
  author_id?: string;
  published_at?: string;
  is_published?: boolean;
  thumbnail_url?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content_md?: string;
  tags?: string[];
  author_id?: string;
  published_at?: string;
  is_published?: boolean;
  thumbnail_url?: string;
} 