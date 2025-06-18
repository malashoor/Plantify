import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export type UserRole = 'admin' | 'grower' | 'child';

interface AuthUser extends User {
  role?: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole;
  isOnline: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: string) => Promise<{ error: string | null }>;
}

// Helper function to check network connectivity
const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected && state.isInternetReachable);
  } catch (error) {
    console.warn('Network check failed:', error);
    return false;
  }
};

// Retry wrapper for network operations
const withNetworkRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        throw new Error('No internet connection');
      }
      
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Network operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Don't retry on auth errors
      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('User already registered')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError!;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const online = Boolean(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
      
      if (!online) {
        console.warn('Device is offline');
      } else {
        console.log('Device is online');
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user as AuthUser || null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user as AuthUser || null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      unsubscribeNetInfo();
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      
      const result = await withNetworkRetry(async () => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name?.trim() || '',
              role: 'grower', // Default role
            }
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      });

      // If email confirmation is required
      if (result.user && !result.session) {
        return { error: 'Please check your email to confirm your account.' };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.message === 'No internet connection') {
        Alert.alert('No Internet', 'Please check your internet connection and try again.');
      }
      
      return { error: error.message || 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      await withNetworkRetry(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      if (error.message === 'No internet connection') {
        Alert.alert('No Internet', 'Please check your internet connection and try again.');
      }
      
      return { error: error.message || 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message || 'Sign out failed' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'exp://localhost:8081/auth/reset-password',
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error: error.message || 'Password reset failed' };
    }
  };

  const signInWithOAuth = async (provider: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: 'exp://localhost:8081/',
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      return { error: error.message || 'OAuth sign in failed' };
    }
  };

  // Determine user role from user metadata or default
  const getUserRole = (): UserRole => {
    if (!user) return 'grower';
    
    // Check user metadata for role
    const role = user.user_metadata?.role || user.app_metadata?.role;
    
    // Validate role
    if (['admin', 'grower', 'child'].includes(role)) {
      return role as UserRole;
    }
    
    return 'grower'; // Default role
  };

  return {
    user,
    session,
    loading,
    userRole: getUserRole(),
    isOnline,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithOAuth,
  };
} 