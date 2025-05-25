import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { SPRING_CONFIG } from '@/utils/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
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

  const getBackgroundColor = () => {
    if (disabled) return Colors.Disabled;
    switch (variant) {
      case 'primary':
        return Colors.Primary;
      case 'secondary':
        return Colors.Secondary;
      case 'outline':
        return 'transparent';
      default:
        return Colors.Primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.Text.Disabled;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return Colors.Text.Light;
      case 'outline':
        return Colors.Primary;
      default:
        return Colors.Text.Light;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: disabled ? Colors.Disabled : Colors.Primary,
      };
    }
    return {};
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getBorderStyle(),
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.MD,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 