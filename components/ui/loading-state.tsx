import React from 'react';
import ReactNative from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';

const { View, StyleSheet, ActivityIndicator } = ReactNative;

type LoadingStateProps = {
  message?: string;
  testID?: string;
};

export const LoadingState = ({
  message,
  testID,
}: LoadingStateProps): React.ReactElement => {
  return (
    <View 
      style={styles.container}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
    >
      <ActivityIndicator size="large" color={Colors.Primary} />
      {message && (
        <Text style={styles.message}>
          {message}
        </Text>
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
    marginTop: Spacing.MD,
    color: Colors.Text.Secondary,
  },
}); 