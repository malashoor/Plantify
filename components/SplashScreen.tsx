import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, useColorScheme } from 'react-native';
import type { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

interface Styles {
  container: ViewStyle;
  containerDark: ViewStyle;
  gradient: ViewStyle;
  leaf: ViewStyle;
  leafBlur: ViewStyle;
  network: ViewStyle;
  logo: ViewStyle;
  particles: ViewStyle;
}

export const SplashScreen = ({ onAnimationComplete }: SplashScreenProps): React.ReactElement => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const leafScale = new Animated.Value(0);
  const networkOpacity = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const particleScale = new Animated.Value(0);

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Leaf appears
      Animated.timing(leafScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      // Neural network overlay fades in
      Animated.timing(networkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Logo appears
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Particles animate
      Animated.timing(particleScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call onAnimationComplete after all animations are done
      setTimeout(onAnimationComplete, 500);
    });
  }, []);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <LinearGradient
        colors={isDark ? ['#121212', '#2D3047'] : ['#45B36B', '#00D4FF']}
        style={styles.gradient}
      >
        {/* Leaf Shape */}
        <Animated.View
          style={[
            styles.leaf,
            {
              transform: [{ scale: leafScale }],
            },
          ]}
        >
          <BlurView intensity={20} style={styles.leafBlur}>
            {/* Leaf SVG or custom shape here */}
          </BlurView>
        </Animated.View>

        {/* Neural Network Overlay */}
        <Animated.View
          style={[
            styles.network,
            {
              opacity: networkOpacity,
            },
          ]}
        >
          {/* Neural network pattern here */}
        </Animated.View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
            },
          ]}
        >
          {/* GreensAI logo here */}
        </Animated.View>

        {/* Particles */}
        <Animated.View
          style={[
            styles.particles,
            {
              transform: [{ scale: particleScale }],
            },
          ]}
        >
          {/* Particle effects here */}
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#45B36B',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaf: {
    width: 200,
    height: 200,
    position: 'absolute',
  },
  leafBlur: {
    flex: 1,
    borderRadius: 100,
  },
  network: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  logo: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
  },
}); 