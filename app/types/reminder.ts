export type ReminderType = 'journal' | 'seed' | 'system' | 'hydroponic' | 'medication';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed' | 'snoozed';
export type RepeatInterval = 'daily' | 'weekly' | 'monthly' | null;
export type HydroponicTaskCategory = 'daily_check' | 'nutrient_refill' | 'harvest_alert' | 'ph_balance' | 'water_change' | 'system_clean';
export type ReminderContextType = 'plant' | 'hydroponic' | 'medication' | 'general';

export interface Reminder {
    id: string;
    user_id: string;
    title: string;
    type: ReminderType;
    related_id?: string;
    trigger_date: string;
    repeat_interval: RepeatInterval;
    status: ReminderStatus;
    created_at: string;
    updated_at: string;
    context_type?: ReminderContextType;
    priority?: 'low' | 'medium' | 'high';
    emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
    category?: HydroponicTaskCategory;
}

export interface CreateReminderInput {
    title: string;
    type: ReminderType;
    related_id?: string;
    trigger_date: string;
    repeat_interval?: RepeatInterval;
    context_type?: ReminderContextType;
    priority?: 'low' | 'medium' | 'high';
    emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
    category?: HydroponicTaskCategory;
}

export interface UpdateReminderInput {
    title?: string;
    trigger_date?: string;
    repeat_interval?: RepeatInterval;
    status?: ReminderStatus;
    priority?: 'low' | 'medium' | 'high';
    emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
    category?: HydroponicTaskCategory;
} 