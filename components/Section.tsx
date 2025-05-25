import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Spacing, Colors } from '@/theme';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.L,
    paddingHorizontal: Spacing.M,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.S,
    color: Colors.text.primary,
  },
  content: {
    marginTop: Spacing.S,
  } as ViewStyle,
}); 