export type Environment = 'indoor' | 'outdoor';

export interface Seed {
  id: string;
  user_id: string;
  name: string;
  species: string;
  planted_at: string;
  environment: Environment;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSeedInput {
  name: string;
  species: string;
  environment: Environment;
  notes?: string;
  image_url?: string;
}

export interface UpdateSeedInput {
  name?: string;
  species?: string;
  environment?: Environment;
  notes?: string;
  image_url?: string;
}
