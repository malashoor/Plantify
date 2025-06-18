import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  I18nManager,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [language, setLanguage] = useState('en'); // 'en' or 'ar'

  const slides = [
    {
      title: {
        en: 'Welcome to Plantify',
        ar: 'مرحباً بك في بلانتيفاي',
      },
      subtitle: {
        en: 'Your AI-powered plant care companion',
        ar: 'رفيقك في العناية بالنباتات بالذكاء الاصطناعي',
      },
      icon: '🌱',
    },
    {
      title: {
        en: 'Smart Plant Care',
        ar: 'العناية الذكية بالنباتات',
      },
      subtitle: {
        en: 'Get personalized care recommendations for your plants',
        ar: 'احصل على توصيات شخصية للعناية بنباتاتك',
      },
      icon: '🤖',
    },
    {
      title: {
        en: 'Track & Monitor',
        ar: 'تتبع ومراقبة',
      },
      subtitle: {
        en: 'Monitor soil moisture, light levels, and plant health',
        ar: 'راقب رطوبة التربة ومستويات الضوء وصحة النبات',
      },
      icon: '📊',
    },
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Slide animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    I18nManager.forceRTL(newLang === 'ar');
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
    }
  };

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  const isRTL = language === 'ar';
  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#8BC34A', '#CDDC39']} style={styles.gradient}>
        {/* Language Toggle */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.languageButton}
            accessibilityLabel={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            <Text style={styles.languageText}>{language === 'en' ? 'عربي' : 'EN'}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.slideContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Icon */}
            <Text style={styles.icon}>{currentSlideData.icon}</Text>

            {/* Title */}
            <Text style={[styles.title, isRTL && styles.titleRTL]} accessibilityRole="header">
              {currentSlideData.title[language]}
            </Text>

            {/* Subtitle */}
            <Text style={[styles.subtitle, isRTL && styles.subtitleRTL]}>
              {currentSlideData.subtitle[language]}
            </Text>
          </Animated.View>

          {/* Slide Indicators */}
          <View style={styles.indicators}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.indicator, index === currentSlide && styles.activeIndicator]}
              />
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, isRTL && styles.bottomNavRTL]}>
          {currentSlide > 0 && (
            <TouchableOpacity
              onPress={prevSlide}
              style={[styles.navButton, styles.prevButton]}
              accessibilityLabel={language === 'en' ? 'Previous' : 'السابق'}
            >
              <Text style={styles.navButtonText}>{isRTL ? '→' : '←'}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.spacer} />

          {currentSlide < slides.length - 1 ? (
            <TouchableOpacity
              onPress={nextSlide}
              style={[styles.navButton, styles.nextButton]}
              accessibilityLabel={language === 'en' ? 'Next' : 'التالي'}
            >
              <Text style={styles.navButtonText}>{isRTL ? '←' : '→'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleGetStarted}
              style={[styles.getStartedButton]}
              accessibilityLabel={language === 'en' ? 'Get Started' : 'ابدأ الآن'}
            >
              <Text style={styles.getStartedText}>
                {language === 'en' ? 'Get Started' : 'ابدأ الآن'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerRTL: {
    justifyContent: 'flex-start',
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.6,
  },
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleRTL: {
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: width * 0.8,
  },
  subtitleRTL: {
    writingDirection: 'rtl',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'white',
    width: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  bottomNavRTL: {
    flexDirection: 'row-reverse',
  },
  spacer: {
    flex: 1,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    marginRight: 15,
  },
  nextButton: {
    marginLeft: 15,
  },
  navButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
