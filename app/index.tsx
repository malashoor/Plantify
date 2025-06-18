import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@hooks/useAuth';

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      if (!onboardingComplete && !user) {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  // If user is logged in, go to tabs, otherwise go to landing
  return <Redirect href={user ? "/(tabs)" : "/landing"} />;
}
