import { Stack } from 'expo-router';
import OnboardingScreen from '../components/OnboardingScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';

export default function OnboardingRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingScreen />
    </SafeAreaView>
  );
} 