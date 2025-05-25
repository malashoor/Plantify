// Import polyfills first
import '../utils/webPolyfills';

import { ThemeProvider } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ReactNative from 'react-native';
import Animated from 'react-native-reanimated';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Colors } from '../theme/colors';

import { lightTheme, darkTheme } from '../constants/theme';
import { Providers } from './_providers';

const { Platform, useColorScheme, I18nManager, View, Text, ActivityIndicator, StyleSheet } = ReactNative;

// Enable RTL support when needed
const initializeRTL = async () => {
  try {
    const language = await AsyncStorage.getItem('userLanguage');
    const shouldUseRTL = language === 'ar' || language === 'he';
    
    // Only force update if we're changing the RTL setting
    if (shouldUseRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(shouldUseRTL);
      
      // In a real app, you might need to restart the app
      // For now, we'll just reload if we're on web
      if (Platform.OS === 'web') {
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('Error initializing RTL:', error);
  }
};

// Prevent native splash screen from autohiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore errors */
});

// Handle deep links - plantai://plant/:id
const handleDeepLink = (segments) => {
  if (segments[0] === 'plant' && segments.length > 1) {
    return `/plants/${segments[1]}`;
  }
  return null;
};

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const segments = useSegments();
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Platform.select({
      web: 'Poppins, system-ui, sans-serif',
      default: 'System',
    }),
    'Poppins-Medium': Platform.select({
      web: 'Poppins, system-ui, sans-serif',
      default: 'System',
    }),
    'Poppins-Bold': Platform.select({
      web: 'Poppins-Bold, Poppins, system-ui, sans-serif',
      default: 'System',
    }),
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Initialize RTL support
    initializeRTL();
    
    // Handle deep links
    if (segments.length > 0) {
      const redirectPath = handleDeepLink(segments);
      if (redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [segments]);

  useEffect(() => {
    // Check if user has seen onboarding
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        if (fontsLoaded || fontError) {
          // Hide splash screen when fonts are loaded
          SplashScreen.hideAsync().catch(() => {
            /* ignore errors */
          });
          
          // If user hasn't seen onboarding, redirect them
          if (hasSeenOnboarding !== 'true') {
            router.replace('/onboarding');
          }
          
          setHasCheckedOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        if (fontsLoaded || fontError) {
          SplashScreen.hideAsync().catch(() => {
            /* ignore errors */
          });
          setHasCheckedOnboarding(true);
        }
      }
    };
    
    checkOnboarding();
  }, [fontsLoaded, fontError, router]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Keep showing loading screen while we check onboarding status
  if (!hasCheckedOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Custom toast config
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#2E7D32' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '500',
          fontFamily: 'Poppins-Medium',
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Poppins-Regular',
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: '#FF5252' }}
        text1Style={{
          fontSize: 16,
          fontWeight: '500',
          fontFamily: 'Poppins-Medium',
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Poppins-Regular',
        }}
      />
    ),
  };

  return (
    <ThemeProvider theme={theme}>
      <Providers>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDark ? Colors.Background.Dark : Colors.Background.Light,
            },
            animation: 'slide_from_right',
            animationDuration: 200,
            presentation: 'card',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, next, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            }),
          }}
        >
          {/* Main tab navigation */}
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          
          {/* Modal screens */}
          <Stack.Screen 
            name="add-plant" 
            options={{ 
              presentation: 'modal',
              title: 'Add New Plant',
              headerBackTitle: 'Back',
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="scan-qr" 
            options={{ 
              presentation: 'modal',
              title: 'Scan QR Code',
              headerBackTitle: 'Back',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="log-ph" 
            options={{ 
              presentation: 'modal',
              title: 'Log pH Reading',
              headerBackTitle: 'Back',
              animation: 'slide_from_bottom',
            }}
          />
          
          {/* Deep link target */}
          <Stack.Screen 
            name="plants/[id]" 
            options={{ 
              title: 'Plant Details',
              headerBackTitle: 'Plants',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Toast config={toastConfig} />
      </Providers>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'System',
  },
});
