import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';

type CardProps = {
  children: React.ReactElement | React.ReactElement[];
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export const Card = ({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) => {
  const Container = onPress ? View : View; // TODO: Replace with Pressable when available
  
  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.Background.Light,
    borderRadius: 12,
    padding: Spacing.MD,
    ...(Platform.OS === 'ios' ? {
      shadowColor: Colors.Text.Primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 3,
    }),
  },
}); 