import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize the Supabase client
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check your app.config.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if user has admin role
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data?.role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
} 