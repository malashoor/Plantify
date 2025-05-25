import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

/**
 * Load and cache all necessary assets for the app
 */
export function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that needed for the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });

        // Pre-load images
        await Promise.all([
          Asset.loadAsync([
            require('../assets/icons/plantify_icon_1024x1024.png'),
            require('../assets/images/splash.png'),
            require('../assets/images/splash-dark.png'),
            require('../assets/images/onboarding-1.png'),
            require('../assets/images/onboarding-2.png'),
            require('../assets/images/onboarding-3.png'),
          ]),
          // Additional image caching for optimal performance
          Asset.fromURI('https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb').downloadAsync(),
          Asset.fromURI('https://images.unsplash.com/photo-1585502897150-3a5e3d6d9b76').downloadAsync(),
        ]);

        // Additional setup logic can go here
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
} 