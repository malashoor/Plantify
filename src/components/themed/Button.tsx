import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useThemeColor } from '@hooks/useThemeColor';

export interface ButtonProps extends TouchableOpacityProps {
  children?: string | string[] | number;
  disabled?: boolean;
}

export function Button({ children, style, disabled = false, ...props }: ButtonProps) {
  const backgroundColor = useThemeColor({}, disabled ? 'buttonDisabled' : 'buttonBackground');
  const textColor = useThemeColor({}, disabled ? 'textDisabled' : 'buttonText');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 