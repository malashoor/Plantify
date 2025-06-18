import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  testID?: string;
  isRetrying?: boolean;
  timeRemaining?: number | null;
  attempt?: number;
  maxAttempts?: number;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  onCancel,
  icon = 'error-outline',
  testID,
  isRetrying = false,
  timeRemaining = null,
  attempt = 0,
  maxAttempts = 3,
}) => {
  const { colors, spacing } = useTheme();

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getRetryButtonText = (): string => {
    if (isRetrying && timeRemaining !== null) {
      return `Retrying in ${formatTimeRemaining(timeRemaining)}...`;
    }
    if (attempt > 0) {
      return `Retry (${attempt}/${maxAttempts})`;
    }
    return 'Retry';
  };

  const styles = StyleSheet.create({
    container: {
      padding: spacing.large,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginBottom: spacing.medium,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.small,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: onRetry ? spacing.medium : 0,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.medium,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.medium,
      borderRadius: spacing.small,
      backgroundColor: isRetrying ? colors.disabled : colors.primary,
      opacity: isRetrying ? 0.7 : 1,
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.medium,
      borderRadius: spacing.small,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: spacing.small,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: spacing.small,
    },
    attemptText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.small,
    },
  });

  const accessibilityLabel = `${title}. ${message}${
    isRetrying
      ? `. Retrying in ${formatTimeRemaining(timeRemaining || 0)}`
      : onRetry
        ? '. Tap to retry'
        : ''
  }`;

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialIcons name={icon} size={48} color={colors.error} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {(onRetry || onCancel) && (
        <View style={styles.buttonContainer}>
          {onRetry && (
            <Pressable
              onPress={onRetry}
              style={styles.retryButton}
              disabled={isRetrying}
              accessibilityRole="button"
              accessibilityLabel={getRetryButtonText()}
              accessibilityState={{ disabled: isRetrying }}
            >
              <MaterialIcons name="refresh" size={20} color={colors.onPrimary} />
              <Text style={styles.buttonText}>{getRetryButtonText()}</Text>
            </Pressable>
          )}

          {onCancel && isRetrying && (
            <Pressable
              onPress={onCancel}
              style={styles.cancelButton}
              accessibilityRole="button"
              accessibilityLabel="Cancel retry"
            >
              <MaterialIcons name="close" size={20} color={colors.text} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      )}

      {attempt > 0 && (
        <Text style={styles.attemptText}>
          Attempt {attempt} of {maxAttempts}
        </Text>
      )}
    </View>
  );
};
