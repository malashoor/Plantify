import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelector from '../src/components/language/LanguageSelector';
import LanguagePickerModal from '../src/components/language/LanguagePickerModal';
import type { LanguageCode } from '../src/utils/i18n';

export default function LandingScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasSelectedLanguage = await AsyncStorage.getItem('hasSelectedLanguage');
      if (!hasSelectedLanguage) {
        setShowLanguagePicker(true);
      }
    } catch (error) {
      console.error('Failed to check first launch:', error);
    }
  };

  const handleLanguagePickerClose = async () => {
    try {
      await AsyncStorage.setItem('hasSelectedLanguage', 'true');
      setShowLanguagePicker(false);
    } catch (error) {
      console.error('Failed to save language selection:', error);
    }
  };

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleExploreAsGuest = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <LanguageSelector variant="minimal" showIcon={false} />
      </View>

      {/* Language Picker Modal */}
      <LanguagePickerModal
        isVisible={showLanguagePicker}
        onClose={handleLanguagePickerClose}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <Ionicons name="leaf" size={60} color={isDark ? '#A3E635' : '#45B36B'} />
          </View>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {t('landing.title')}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.textLightDark]}>
            {t('landing.subtitle')}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="camera"
            title={t('landing.features.identification.title')}
            description={t('landing.features.identification.description')}
            isDark={isDark}
          />
          <FeatureItem
            icon="journal"
            title={t('landing.features.journal.title')}
            description={t('landing.features.journal.description')}
            isDark={isDark}
          />
          <FeatureItem
            icon="notifications"
            title={t('landing.features.reminders.title')}
            description={t('landing.features.reminders.description')}
            isDark={isDark}
          />
          <FeatureItem
            icon="water"
            title={t('landing.features.hydroponics.title')}
            description={t('landing.features.hydroponics.description')}
            isDark={isDark}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('landing.buttons.getStarted')}
          >
            <Text style={styles.primaryButtonText}>
              {t('landing.buttons.getStarted')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, isDark && styles.secondaryButtonDark]}
            onPress={handleLogin}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('landing.buttons.login')}
          >
            <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
              {t('landing.buttons.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleExploreAsGuest}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('landing.buttons.guest')}
          >
            <Text style={[styles.guestButtonText, isDark && styles.textLightDark]}>
              {t('landing.buttons.guest')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.textLightDark]}>
            {t('landing.footer')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isDark?: boolean;
}

function FeatureItem({ icon, title, description, isDark }: FeatureItemProps) {
  return (
    <View style={[styles.featureItem, isDark && styles.featureItemDark]}>
      <View style={[styles.featureIconContainer, isDark && styles.featureIconContainerDark]}>
        <Ionicons name={icon} size={32} color={isDark ? '#A3E635' : '#45B36B'} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, isDark && styles.textDark]}>{title}</Text>
        <Text style={[styles.featureDescription, isDark && styles.textLightDark]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  languageContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5fff5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#45B36B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainerDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#A3E635',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  textDark: {
    color: '#F3F4F6',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
  featuresContainer: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  featureItemDark: {
    backgroundColor: '#1F2937',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5fff5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIconContainerDark: {
    backgroundColor: '#374151',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#45B36B',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#45B36B',
  },
  secondaryButtonDark: {
    backgroundColor: '#1F2937',
    borderColor: '#A3E635',
  },
  secondaryButtonText: {
    color: '#45B36B',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonTextDark: {
    color: '#A3E635',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestButtonText: {
    color: '#666',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
}); 