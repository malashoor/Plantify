import { useEffect, useState } from 'react';

import { supabase } from '@/utils/supabase';
import { useColorScheme } from 'react-native';


declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function initializeFramework() {
      try {
        // Test Supabase connection
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error);
        }

        // Add more initialization logic here if needed

        setIsReady(true);
      } catch (error) {
        console.error('Framework initialization error:', error);
        setIsReady(false);
      }
    }

    initializeFramework();
  }, []);

  return {
    isReady,
    isDark: colorScheme === 'dark',
  };
}
