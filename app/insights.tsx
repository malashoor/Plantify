import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { EmotionalInsightsScreen } from '@screens/insights/EmotionalInsightsScreen';

export default function InsightsScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Plant Care Insights',
          headerLargeTitle: true,
        }}
      />
      <View style={{ flex: 1 }}>
        <EmotionalInsightsScreen />
      </View>
    </>
  );
} 