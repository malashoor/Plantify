import React from 'react';
import { View, StyleSheet, useColorScheme, Animated } from 'react-native';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  style?: any;
}

export function ProgressIndicator({ totalSteps, currentStep, style }: ProgressIndicatorProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            isDark && styles.dotDark,
            index === currentStep && styles.dotActive,
            isDark && index === currentStep && styles.dotActiveDark,
            index < currentStep && styles.dotCompleted,
            isDark && index < currentStep && styles.dotCompletedDark,
          ]}
        >
          {index < currentStep && (
            <View style={[styles.checkmark, isDark && styles.checkmarkDark]} />
          )}
        </View>
      ))}
      <View
        style={[
          styles.progressBar,
          isDark && styles.progressBarDark,
          { width: `${(currentStep / (totalSteps - 1)) * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 40,
    position: 'relative',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDark: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  dotActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  dotActiveDark: {
    borderColor: '#22C55E',
    backgroundColor: '#064E3B',
  },
  dotCompleted: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  dotCompletedDark: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E',
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  checkmarkDark: {
    backgroundColor: '#F3F4F6',
  },
  progressBar: {
    position: 'absolute',
    left: 24,
    top: '50%',
    height: 2,
    backgroundColor: '#16A34A',
    zIndex: 0,
    transform: [{ translateY: -1 }],
  },
  progressBarDark: {
    backgroundColor: '#22C55E',
  },
});
