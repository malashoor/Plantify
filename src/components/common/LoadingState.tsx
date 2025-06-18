import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from '@react-native-material/core';
import { useTheme } from '../../hooks/useTheme';

export const LoadingState = ({ testID }: { testID?: string }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
