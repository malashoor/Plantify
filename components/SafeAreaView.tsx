import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView as NativeSafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type Props = ViewProps & {
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
};

export function SafeAreaView({ style, children, edges, ...props }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <NativeSafeAreaView
      style={[styles.container, { backgroundColor: colors.background }, style]}
      edges={edges}
      {...props}
    >
      {children}
    </NativeSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
