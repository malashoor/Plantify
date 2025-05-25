export type SystemType = 'NFT' | 'DWC' | 'Drip';

export interface HydroponicSystem {
  id: string;
  name: string;
  type: SystemType;
  location: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface SystemMeasurement {
  id: string;
  system_id: string;
  ph_level: number;
  ec_level: number;
  water_temperature: number;
  nitrogen_level: number;
  phosphorus_level: number;
  potassium_level: number;
  notes?: string;
  measured_at: string;
}

export interface LightingSchedule {
  id: string;
  system_id: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  created_at: string;
  updated_at: string;
}

export interface HydroponicSystemWithDetails extends HydroponicSystem {
  measurements: SystemMeasurement[];
  lighting_schedules: LightingSchedule[];
}
