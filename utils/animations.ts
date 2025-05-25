import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  useAnimatedStyle,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

// Spring configuration for button press animations
export const SPRING_CONFIG = {
  damping: 10,
  mass: 1,
  stiffness: 100,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

// Timing configuration for fade animations
export const FADE_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

// Timing configuration for slide animations
export const SLIDE_CONFIG = {
  duration: 400,
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

// Hook for fade in animation
export function useFadeIn(delay = 0) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, FADE_CONFIG)
    );
  }, [delay]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
}

// Hook for press animation
export function usePressAnimation() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, SPRING_CONFIG);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}

// Hook for pulse animation
export function usePulseAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
} 