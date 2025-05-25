import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { TextStyles } from '@/theme/text';

interface OnboardingSlideProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: any;
  };
  index: number;
  scrollX: Animated.SharedValue<number>;
  width: number;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  item,
  index,
  scrollX,
  width,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const inputRange = [
    (index - 1) * width,
    index * width,
    (index + 1) * width,
  ];

  const imageAnimStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      'clamp'
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      'clamp'
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const textAnimStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20],
      'clamp'
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      'clamp'
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.imageContainer, imageAnimStyle]}>
        <Image
          source={item.image}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel={item.title}
        />
      </Animated.View>
      <Animated.View style={[styles.textContainer, textAnimStyle]}>
        <Text
          style={[TextStyles.H1, isDark && TextStyles.H1_Dark]}
          accessibilityRole="header"
        >
          {item.title}
        </Text>
        <Text
          style={[TextStyles.Body, isDark && TextStyles.Body_Dark]}
          accessibilityRole="text"
        >
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.MD,
  },
  imageContainer: {
    width: '80%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.XL,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: Spacing.LG,
  },
}); 