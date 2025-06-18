export type ReminderType =
  | 'journal'
  | 'seed'
  | 'system'
  | 'hydroponic'
  | 'medication'
  | 'watering'
  | 'fertilizing'
  | 'pruning'
  | 'repotting'
  | 'general';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed' | 'snoozed';
export type RepeatInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | null;
export type HydroponicTaskCategory =
  | 'daily_check'
  | 'nutrient_refill'
  | 'harvest_alert'
  | 'ph_balance'
  | 'water_change'
  | 'system_clean';
export type ReminderContextType = 'plant' | 'hydroponic' | 'medication' | 'general';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: ReminderType;
  plantId?: string;
  scheduledDate: string;
  repeatInterval?: RepeatInterval;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  related_id?: string;
  status: ReminderStatus;
  context_type?: ReminderContextType;
  priority?: 'low' | 'medium' | 'high';
  emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
  category?: HydroponicTaskCategory;
}

export interface CreateReminderInput {
  title: string;
  type: ReminderType;
  related_id?: string;
  scheduledDate: string;
  repeatInterval?: RepeatInterval;
  context_type?: ReminderContextType;
  priority?: 'low' | 'medium' | 'high';
  emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
  category?: HydroponicTaskCategory;
}

export interface UpdateReminderInput {
  title?: string;
  scheduledDate?: string;
  repeatInterval?: RepeatInterval;
  status?: ReminderStatus;
  priority?: 'low' | 'medium' | 'high';
  emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
  category?: HydroponicTaskCategory;
}
