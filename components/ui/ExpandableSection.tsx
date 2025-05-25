import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  style?: ViewStyle;
}

export function ExpandableSection({
  title,
  children,
  initiallyExpanded = false,
  onToggle,
  style,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const animation = useSharedValue(initiallyExpanded ? 1 : 0);

  const toggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    animation.value = withTiming(newExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
    onToggle?.(newExpanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(animation.value, [0, 1], [0, 1000]),
    opacity: animation.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={toggle} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={24} color={Colors.Text.Primary} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Background.Light,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.MD,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Text.Primary,
  },
  content: {
    overflow: 'hidden',
  },
}); 