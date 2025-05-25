export type EmotionTag =
  | 'excited'
  | 'worried'
  | 'confused'
  | 'happy'
  | 'satisfied'
  | 'disappointed'
  | 'neutral';

export interface PlantJournal {
  id: string;
  user_id: string;
  plant_id: string;
  entry_date: string;
  notes: string;
  photo_url?: string;
  emotion_tag?: EmotionTag;
  created_at: string;
  updated_at: string;
}

export interface PlantJournalWithDetails extends PlantJournal {
  plant_name: string;
  plant_image_url?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  plant_id: string;
  plant_name: string;
  emoji: string;
  note: string;
  photo?: string;
  created_at: string;
  updated_at?: string;
}

export interface JournalFormData {
  plantId: string;
  plantName: string;
  emoji: string;
  note: string;
  photo?: string;
}
