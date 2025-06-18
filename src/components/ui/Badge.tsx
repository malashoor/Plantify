import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Text } from './Text';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function Badge({ 
  label,
  color = '#9E9E9E',
  size = 'medium',
  style,
}: BadgeProps) {
  const sizeStyles = {
    small: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    large: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 16,
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color + '20', // Add transparency
          borderColor: color,
        },
        {
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color, fontSize: sizeStyles[size].fontSize },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
}); 