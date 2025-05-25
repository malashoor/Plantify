import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, I18nManager, AccessibilityInfo, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { FlatList as GestureFlatList } from 'react-native-gesture-handler';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { OnboardingSlide } from './OnboardingSlide';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { TextStyles } from '@/theme/text';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
}

interface ViewableItems {
  viewableItems: Array<{
    index: number;
    item: OnboardingSlide;
    isViewable: boolean;
    key: string;
  }>;
  changed: Array<{
    index: number;
    item: OnboardingSlide;
    isViewable: boolean;
    key: string;
  }>;
}

const { width } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

const AnimatedFlatList = Animated.createAnimatedComponent(GestureFlatList);

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<GestureFlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onboardingData: OnboardingSlide[] = [
    {
      id: '1',
      title: t('onboarding.slide1.title', 'Scan to identify your plant'),
      description: t(
        'onboarding.slide1.description',
        'Take a photo or upload from your gallery to instantly identify plants and get care instructions.'
      ),
      image: require('../assets/images/onboarding/scan-plant.png'),
    },
    {
      id: '2',
      title: t('onboarding.slide2.title', 'Seed to grow guidance'),
      description: t(
        'onboarding.slide2.description',
        'Get step-by-step guidance from seed to harvest with AI-powered insights and personalized care plans.'
      ),
      image: require('../assets/images/onboarding/seed-guidance.png'),
    },
    {
      id: '3',
      title: t('onboarding.slide3.title', 'Live hydroponic monitoring'),
      description: t(
        'onboarding.slide3.description',
        'Monitor your hydroponic system in real-time with smart sensors and automated alerts for optimal growth.'
      ),
      image: require('../assets/images/onboarding/hydroponic-monitoring.png'),
    },
  ];

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: isRTL ? currentIndex - 1 : currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: ViewableItems) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const slideData = onboardingData[currentIndex];
      const announcement = `${slideData.title}. ${slideData.description}. ${
        currentIndex + 1
      } of ${onboardingData.length}`;
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [currentIndex]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Button
        variant="text"
        onPress={handleSkip}
        style={styles.skipButton}
        accessibilityLabel={t('onboarding.skip', 'Skip')}
        accessibilityHint={t(
          'onboarding.skipHint',
          'Skips onboarding and goes to home screen'
        )}
      >
        <Text style={[TextStyles.Skip, isDark && TextStyles.Skip_Dark]}>
          {t('onboarding.skip', 'Skip')}
        </Text>
      </Button>

      <AnimatedFlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            item={item}
            index={index}
            scrollX={scrollX}
            width={width}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        inverted={isRTL}
      />

      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const animStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 24, 8],
              'clamp'
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              'clamp'
            );
            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.indicator,
                animStyle,
                isDark && styles.indicatorDark,
                index === currentIndex && styles.activeIndicator,
                index === currentIndex && isDark && styles.activeIndicatorDark,
              ]}
            />
          );
        })}
      </View>

      <Button
        variant="primary"
        onPress={nextSlide}
        style={styles.button}
        accessibilityLabel={
          currentIndex === onboardingData.length - 1
            ? t('onboarding.getStarted', 'Get Started')
            : t('onboarding.next', 'Next')
        }
      >
        <Text style={TextStyles.Button}>
          {currentIndex === onboardingData.length - 1
            ? t('onboarding.getStarted', 'Get Started')
            : t('onboarding.next', 'Next')}
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background.Light,
  },
  containerDark: {
    backgroundColor: Colors.Background.Dark,
  },
  flatList: {
    flexGrow: 0,
  },
  flatListContent: {
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.XL,
  },
  indicator: {
    height: Spacing.XS,
    width: Spacing.XS,
    borderRadius: Spacing.XS / 2,
    backgroundColor: Colors.Indicator.Inactive,
    marginHorizontal: Spacing.XS / 2,
  },
  indicatorDark: {
    backgroundColor: Colors.Indicator.InactiveDark,
  },
  activeIndicator: {
    backgroundColor: Colors.Indicator.Active,
  },
  activeIndicatorDark: {
    backgroundColor: Colors.Indicator.ActiveDark,
  },
  button: {
    marginTop: Spacing.XL,
    marginBottom: Spacing.XL,
    minWidth: 200,
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.SkipButton.Top,
    right: Spacing.SkipButton.Right,
    zIndex: 10,
    padding: Spacing.XS,
  },
}); 