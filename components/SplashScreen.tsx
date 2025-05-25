import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Image } from 'expo-image';
import { useCachedResources } from '@/hooks/useCachedResources';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore errors */
});

interface Props {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: Props) {
  const [isLottieReady, setIsLottieReady] = useState(false);
  const [isStaticLogoVisible, setIsStaticLogoVisible] = useState(true);
  const assetsLoaded = useCachedResources();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const logoOpacity = useSharedValue(1);
  const lottieOpacity = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  // Static logo animation style
  const logoAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
    };
  });

  // Lottie animation style
  const lottieAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: lottieOpacity.value,
    };
  });

  // Splash screen container style
  const splashAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: splashOpacity.value,
    };
  });

  const finishSplash = () => {
    // Hide the splash screen when all animations are done
    SplashScreen.hideAsync().catch(() => {
      /* ignore errors */
    });
    // Tell the app that animation is complete
    onAnimationComplete();
  };

  useEffect(() => {
    if (assetsLoaded && isLottieReady) {
      // Stage 1 - Static logo is already visible (default state)
      
      // After a brief pause, start stage 2 - Fade in the Lottie animation
      setTimeout(() => {
        logoOpacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }, () => {
          runOnJS(setIsStaticLogoVisible)(false);
        });
        
        lottieOpacity.value = withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) });
      }, 1000);
      
      // After Lottie animation, stage 3 - Hide the splash screen
      setTimeout(() => {
        splashOpacity.value = withTiming(0, { 
          duration: 500, 
          easing: Easing.out(Easing.ease) 
        }, () => {
          runOnJS(finishSplash)();
        });
      }, 2000); // Adjust timing for a max 1s Lottie animation + 1s static display
    }
  }, [assetsLoaded, isLottieReady]);

  return (
    <Animated.View
      style={[
        styles.container,
        splashAnimStyle,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      ]}
    >
      {isStaticLogoVisible && (
        <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
          <Image
            source={isDark ? require('../assets/images/splash-dark.png') : require('../assets/images/splash.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Plantify Logo"
          />
        </Animated.View>
      )}

      <Animated.View style={[styles.lottieContainer, lottieAnimStyle]}>
        <LottieView
          source={require('../assets/animations/splash-animation.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
          onLayout={() => setIsLottieReady(true)}
          colorFilters={[
            {
              keypath: 'Plantify Logo',
              color: isDark ? '#4CAF50' : '#2E7D32',
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  lottieContainer: {
    position: 'absolute',
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
}); 