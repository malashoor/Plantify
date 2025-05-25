import React from 'react';
import { StyleSheet } from 'react-native';
import { PricingScreen } from '../components/pricing/PricingScreen';
import { Stack } from 'expo-router';

export default function PricingPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Subscription Plans' }} />
      <PricingScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 