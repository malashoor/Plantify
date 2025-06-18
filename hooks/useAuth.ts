import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'grower' | 'child';

interface AuthUser extends User {
  role?: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: string) => Promise<{ error: string | null }>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      
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
        return { error: error.message };
      }

      // If email confirmation is required
      if (data.user && !data.session) {
        return { error: 'Please check your email to confirm your account.' };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: error.message || 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
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
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithOAuth,
  };
} 