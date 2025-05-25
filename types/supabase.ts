export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          scientific_name: string | null;
          location: string | null;
          category: string | null;
          image_url: string | null;
          watering_frequency: number | null;
          last_watered: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          scientific_name?: string | null;
          location?: string | null;
          category?: string | null;
          image_url?: string | null;
          watering_frequency?: number | null;
          last_watered?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          scientific_name?: string | null;
          location?: string | null;
          category?: string | null;
          image_url?: string | null;
          watering_frequency?: number | null;
          last_watered?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      care_tasks: {
        Row: {
          id: string;
          plant_id: string;
          user_id: string;
          type: string;
          description: string | null;
          due_date: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          user_id: string;
          type: string;
          description?: string | null;
          due_date: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          user_id?: string;
          type?: string;
          description?: string | null;
          due_date?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      plant_identifications: {
        Row: {
          id: string;
          user_id: string;
          image_url: string | null;
          scientific_name: string | null;
          common_name: string | null;
          family: string | null;
          probability: number | null;
          identified_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url?: string | null;
          scientific_name?: string | null;
          common_name?: string | null;
          family?: string | null;
          probability?: number | null;
          identified_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string | null;
          scientific_name?: string | null;
          common_name?: string | null;
          family?: string | null;
          probability?: number | null;
          identified_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Add user role type
export type UserRole = 'child' | 'grower' | 'admin';

// Base user type
export interface BaseUser {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  aud: string;
  created_at: string;
}

export interface User extends BaseUser {
  role?: UserRole;
}
