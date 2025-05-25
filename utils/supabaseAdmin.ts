import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for server-side operations
export const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ADMIN_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
); 