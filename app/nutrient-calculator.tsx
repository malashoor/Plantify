import * as React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import NutrientCalculatorScreen from '@/screens/tools/NutrientCalculatorScreen';

interface Styles {
  container: ViewStyle;
}

export default function NutrientCalculator() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <View style={styles.container}>
        <NutrientCalculatorScreen />
      </View>
    </>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
}); 