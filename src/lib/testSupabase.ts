import { supabase } from './supabase';

/**
 * Tests the Supabase connection by attempting to fetch the server timestamp.
 * This is a lightweight way to verify connectivity without requiring specific table access.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Using a simple system query that doesn't require table permissions
    const { data, error } = await supabase.rpc('get_server_time');

    if (error) {
      console.error('[Supabase Connection Test Error]:', error.message);
      return false;
    }

    // If we got data back, the connection is working
    return !!data;
  } catch (err) {
    console.error('[Supabase Connection Test Error]:', err);
    return false;
  }
}
