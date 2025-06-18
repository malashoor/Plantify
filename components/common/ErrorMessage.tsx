import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    error: '#F44336',
    primary: '#4CAF50',
  },
});

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>Something went wrong</Text>

      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
