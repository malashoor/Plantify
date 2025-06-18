import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
  }
});

export const Section: React.FC<SectionProps> = ({ title, children, style }) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
}); 