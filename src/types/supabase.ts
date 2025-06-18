import { Database } from './supabase-generated';

// Admin role types
export type AdminRole = 'admin' | 'editor' | 'analyst';

export interface AdminRoleRecord {
  user_id: string;
  role: AdminRole;
  created_at: string;
}

// Promotion types
export type PromotionType = 'discount' | 'free_trial' | 'premium_access';

export interface Promotion {
  id: string;
  code: string;
  type: PromotionType;
  value: string;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface UserPromotion {
  user_id: string;
  promotion_id: string;
  applied_at: string;
  promotion?: Promotion;
}

// Error types
export type PromotionError = 
  | 'INVALID_CODE'
  | 'EXPIRED'
  | 'ALREADY_APPLIED'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR';

export interface PromotionResult {
  success: boolean;
  error?: PromotionError;
  promotion?: Promotion;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_emotions: {
        Row: {
          id: string
          user_id: string
          emotion_type: 'joy' | 'concern' | 'frustration' | 'curiosity' | 'satisfaction' | 'neutral'
          intensity: number
          context: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          emotion_type: 'joy' | 'concern' | 'frustration' | 'curiosity' | 'satisfaction' | 'neutral'
          intensity: number
          context?: string | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          emotion_type?: 'joy' | 'concern' | 'frustration' | 'curiosity' | 'satisfaction' | 'neutral'
          intensity?: number
          context?: string | null
          timestamp?: string
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          type: 'conversation' | 'insight' | 'action' | 'preference'
          content: string
          context: Json | null
          importance: number
          timestamp: string
          tags: string[]
          created_at: string
          content_search: unknown
        }
        Insert: {
          id?: string
          user_id: string
          type: 'conversation' | 'insight' | 'action' | 'preference'
          content: string
          context?: Json | null
          importance: number
          timestamp: string
          tags?: string[]
          created_at?: string
          content_search?: unknown
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'conversation' | 'insight' | 'action' | 'preference'
          content?: string
          context?: Json | null
          importance?: number
          timestamp?: string
          tags?: string[]
          created_at?: string
          content_search?: unknown
        }
      }
      // ... existing tables ...
    }
    Functions: {
      get_recent_memories: {
        Args: {
          p_user_id: string
          p_type?: string[]
          p_limit?: number
          p_min_importance?: number
        }
        Returns: Database['public']['Tables']['memories']['Row'][]
      }
      search_memories: {
        Args: {
          p_user_id: string
          p_search_term: string
          p_type?: string[]
          p_limit?: number
        }
        Returns: Database['public']['Tables']['memories']['Row'][]
      }
      // ... existing functions ...
    }
  }
} 