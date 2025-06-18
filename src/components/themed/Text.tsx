import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useThemeColor } from '@hooks/useThemeColor';

export interface TextProps extends RNTextProps {
  children: React.ReactNode;
}

export function Text({ style, ...props }: TextProps) {
  const color = useThemeColor({}, 'text');

  return <RNText style={[{ color }, style]} {...props} />;
}
