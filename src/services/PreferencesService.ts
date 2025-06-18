import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface UserPreferences {
  useLocation: boolean;
  useVoiceFeedback: boolean;
  language: string;
  notifications: boolean;
}

const PREFERENCES_KEY = '@greensai:user_preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  useLocation: true,
  useVoiceFeedback: true,
  language: 'en',
  notifications: true,
};

export class PreferencesService {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (!stored) {
        return DEFAULT_PREFERENCES;
      }
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error reading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  static async updatePreferences(
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      // Get current preferences
      const current = await this.getPreferences();
      const updated = { ...current, ...updates };

      // Save to AsyncStorage
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));

      // Update Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            preferences: updated,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (error) throw error;
      }

      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  static async syncWithSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get preferences from Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data?.preferences) {
        // Merge with local preferences
        const local = await this.getPreferences();
        const merged = { ...local, ...data.preferences };
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
      }
    } catch (error) {
      console.error('Error syncing preferences:', error);
    }
  }

  static async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }
} 