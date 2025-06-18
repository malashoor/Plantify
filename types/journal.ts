export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  plant_id?: string;
  photos?: string[];
  mood?: 'happy' | 'concerned' | 'excited' | 'frustrated';
  weather?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntry {
  title: string;
  content: string;
  plant_id?: string;
  photos?: string[];
  mood?: 'happy' | 'concerned' | 'excited' | 'frustrated';
  weather?: string;
}

export interface JournalFormData {
  title: string;
  content: string;
  plantId?: string;
  imageUrls?: string[];
  tags?: string[];
  mood?: 'happy' | 'neutral' | 'concerned' | 'excited';
}
