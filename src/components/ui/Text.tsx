import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  style?: TextStyle;
}

const variantStyles: Record<NonNullable<TextProps['variant']>, TextStyle> = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
};

export function Text({ 
  children,
  variant = 'body',
  style,
  ...props
}: TextProps) {
  const theme = useTheme();

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: theme.colors.text },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
} 