import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Button } from './Button';

interface PulsingButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  pulseColor?: string;
}

export function PulsingButton({
  title,
  onPress,
  style,
  textStyle,
  pulseColor = Colors.Primary,
}: PulsingButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Start pulsing animation
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Button
        title={title}
        onPress={onPress}
        style={[styles.button, style]}
        textStyle={[styles.text, textStyle]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.MD,
    borderRadius: 8,
    backgroundColor: Colors.Primary,
  },
  text: {
    color: Colors.Text.Light,
    fontSize: 16,
    fontWeight: '600',
  },
}); 