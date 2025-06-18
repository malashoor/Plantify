import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useColorScheme, Platform } from 'react-native';

interface FocusHighlightProps {
  children: React.ReactNode;
  isFocused?: boolean;
  color?: string;
  borderRadius?: number;
  duration?: number;
}

export default function FocusHighlight({
  children,
  isFocused = false,
  color = '#2E7D32',
  borderRadius = 8,
  duration = 200,
}: FocusHighlightProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isFocused ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isFocused, opacity, duration]);

  // Only show focus highlight on non-touch devices (web keyboard navigation)
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.highlight,
          {
            borderRadius,
            opacity,
            borderColor: isDark ? color + '80' : color + '40',
            backgroundColor: isDark ? color + '20' : color + '10',
          },
        ]}
        pointerEvents="none"
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: -4,
    right: -4,
    bottom: -4,
    left: -4,
    borderWidth: 2,
    zIndex: -1,
  },
});
