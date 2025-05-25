import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '@/types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isGrowerOrAdmin: () => boolean;
  canCreate: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
}

// Create a context
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: 'child', // Default to most restrictive role
  loading: true,
  signIn: () => Promise.resolve({ error: null }),
  signUp: () => Promise.resolve({ error: null, data: null }),
  signOut: () => Promise.resolve(),
  isAdmin: () => false,
  isGrowerOrAdmin: () => false,
  canCreate: () => false,
  canEdit: () => false,
  canDelete: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('child');

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role from database if we have a session
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role when auth state changes
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole('child'); // Reset to most restrictive role when signed out
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('auth.users') // This assumes direct access to auth.users table
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('child'); // Default to most restrictive role on error
        return;
      }

      if (data?.role) {
        setUserRole(data.role as UserRole);
      } else {
        setUserRole('grower'); // Default role if not specified
      }
    } catch (error) {
      console.error('Unexpected error fetching user role:', error);
      setUserRole('child');
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Role-based permission checks
  const isAdmin = () => userRole === 'admin';
  
  const isGrowerOrAdmin = () => userRole === 'grower' || userRole === 'admin';
  
  const canCreate = () => isGrowerOrAdmin();
  
  const canEdit = () => isGrowerOrAdmin();
  
  const canDelete = () => isGrowerOrAdmin();

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userRole,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
        isGrowerOrAdmin,
        canCreate,
        canEdit,
        canDelete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 