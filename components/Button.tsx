import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/Colors';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    variant === 'secondary' && styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'secondary' && styles.secondaryText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.textDisabled,
  },
});
