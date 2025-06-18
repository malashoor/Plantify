import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantService } from '../../services/PlantService';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { Plant } from '../../types/Plant';
import { useTheme } from '../../hooks/useTheme';
import { useRetry } from '../../hooks/useRetry';

export const Dashboard: React.FC = () => {
  const { spacing } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.medium,
    },
  });

  const fetchPlants = useCallback(async () => {
    return PlantService.getPlants();
  }, []);

  const {
    execute: loadPlants,
    isLoading,
    error,
    isRetrying,
    timeRemaining,
    attempt,
    retryNow,
    cancel,
    isOffline,
  } = useRetry<Plant[]>(fetchPlants, {
    maxAttempts: 3,
    initialDelayMs: 2000,
    backoffFactor: 2,
    onSuccess: () => {
      // Could trigger a success toast or animation here
    },
    onError: (error) => {
      // Could log the error or show additional UI feedback
      console.error('Failed to load plants:', error);
    },
  });

  // Load plants on mount
  React.useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  if (isLoading && !isRetrying) {
    return <LoadingState message="Loading plants" />;
  }

  if (error) {
    const getErrorDetails = () => {
      if (isOffline) {
        return {
          title: 'No internet connection',
          message: 'Please check your internet connection and try again.',
          icon: 'wifi-off' as const,
        };
      }
      
      if (error.name === 'TimeoutError') {
        return {
          title: 'Request timed out',
          message: 'The server is taking too long to respond. We\'ll try again automatically.',
          icon: 'timer-off' as const,
        };
      }
      
      return {
        title: 'Failed to load plants',
        message: 'An unexpected error occurred. Please try again.',
        icon: 'error-outline' as const,
      };
    };

    const errorDetails = getErrorDetails();

    return (
      <ErrorState
        {...errorDetails}
        onRetry={retryNow}
        onCancel={isRetrying ? cancel : undefined}
        isRetrying={isRetrying}
        timeRemaining={timeRemaining}
        attempt={attempt}
        testID={`error-state-${error.name.toLowerCase()}`}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Existing plant list rendering code */}
    </View>
  );
}; 