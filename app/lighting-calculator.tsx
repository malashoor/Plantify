import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import LightingCalculatorScreen from '@screens/tools/LightingCalculatorScreen';

export default function LightingCalculator() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <View style={styles.container}>
        <LightingCalculatorScreen />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 