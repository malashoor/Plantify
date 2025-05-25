import React from 'react';
import ReactNative from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

const { View, StyleSheet } = ReactNative;

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  testID?: string;
};

export const ErrorState = ({
  message,
  onRetry,
  testID,
}: ErrorStateProps): React.ReactElement => {
  return (
    <View 
      style={styles.container}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${message}`}
    >
      <Text style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="primary"
          onPress={onRetry}
          accessibilityLabel="Retry"
          accessibilityHint="Attempt to load the content again"
        >
          Retry
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.LG,
  },
  message: {
    marginBottom: Spacing.MD,
    color: Colors.Error,
    textAlign: 'center',
  },
}); 