import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

interface SeedCardProps {
  name: string;
  tier: string;
  onPress: () => void;
  style?: ViewStyle;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SeedCard({ 
  name, 
  tier, 
  onPress, 
  style,
  index = 0,
}: SeedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Stagger the entrance animation based on index
    const delay = index * 100;
    
    setTimeout(() => {
      opacity.value = withTiming(1, { 
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
  }, [index]);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle, style]}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.tierContainer}>
          <Text style={styles.tier}>{tier}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Background.Light,
    borderRadius: 12,
    marginBottom: Spacing.MD,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: Spacing.MD,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Text.Primary,
    marginBottom: Spacing.XS,
    fontFamily: 'Poppins-Medium',
  },
  tierContainer: {
    backgroundColor: Colors.Primary + '20',
    paddingHorizontal: Spacing.SM,
    paddingVertical: Spacing.XS,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tier: {
    fontSize: 12,
    color: Colors.Primary,
    fontFamily: 'Poppins-Regular',
  },
}); 