import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { Colors } from '@/theme/colors';

interface AnimatedLoadingProps {
  isLoading: boolean;
  isSuccess?: boolean;
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

export function AnimatedLoading({
  isLoading,
  isSuccess = false,
  size = 'large',
  color = Colors.Primary,
  style,
}: AnimatedLoadingProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isSuccess) {
      // Animate to success state
      scale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      opacity.value = withTiming(1, { duration: 300 });
    } else if (isLoading) {
      // Start loading animation
      rotation.value = withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      });
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Fade out
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isLoading, isSuccess, scale, opacity, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        {isLoading && !isSuccess ? (
          <ActivityIndicator size={size} color={color} />
        ) : isSuccess ? (
          <Check size={size === 'large' ? 32 : 24} color={color} />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 