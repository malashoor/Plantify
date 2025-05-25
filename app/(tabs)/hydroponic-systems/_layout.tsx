import { Stack } from 'expo-router';

import ErrorBoundary from '@/components/ErrorBoundary';

export default function HydroponicSystemsLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}
