import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Basic protected route hook - for now just allow all access
export function useProtectedRoute() {
  const router = useRouter();
  
  useEffect(() => {
    // In a real app, you would check authentication state here
    // For now, we'll just allow access to all routes
    const isAuthenticated = true; // Placeholder
    
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, []);

  return {
    isAuthenticated: true, // Always return true for now
  };
} 