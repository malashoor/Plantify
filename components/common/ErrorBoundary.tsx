import { Text, Button } from '@rneui/themed';
import React from 'react';

import { HydroponicError } from '@/types/errors';
import { View, StyleSheet } from 'react-native';


interface ErrorBoundaryProps {
  error: Error | HydroponicError | null;
  message?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function ErrorBoundary({ error, message, onRetry, children }: ErrorBoundaryProps) {
  if (!error) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>
        {message || 'Something went wrong'}
      </Text>
      <Text style={styles.message}>{error.message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          accessibilityLabel="Retry the operation"
          accessibilityHint="Attempt to perform the operation again"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
}); 