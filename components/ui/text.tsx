import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { TextStyles } from '@/theme/text';

interface TextProps {
  children: React.ReactNode;
  style?: TextStyle;
  accessibilityRole?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  accessibilityRole,
}) => {
  const textStyle = [TextStyles.Body, style] as const;

  return (
    <RNText
      style={textStyle}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </RNText>
  );
}; 