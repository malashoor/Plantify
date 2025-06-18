import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  useColorScheme,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, type LanguageCode, changeLanguage } from '../../utils/i18n';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface LanguagePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function LanguagePickerModal({ isVisible, onClose }: LanguagePickerModalProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          mass: 1,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleLanguageSelect = async (lng: LanguageCode) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.selectionAsync();
      }
      await changeLanguage(lng);
      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 25 : 100}
        tint={isDark ? 'dark' : 'light'}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.content,
            isDark && styles.contentDark,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons 
              name="language" 
              size={32} 
              color={isDark ? '#A3E635' : '#45B36B'} 
            />
            <Text style={[styles.title, isDark && styles.textDark]}>
              {t('languagePicker.title')}
            </Text>
            <Text style={[styles.subtitle, isDark && styles.textLightDark]}>
              {t('languagePicker.subtitle')}
            </Text>
          </View>

          {/* Language Options */}
          <View style={styles.languagesContainer}>
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.languageButton,
                  isDark && styles.languageButtonDark,
                  i18n.language === code && styles.languageButtonSelected,
                  i18n.language === code && isDark && styles.languageButtonSelectedDark,
                ]}
                onPress={() => handleLanguageSelect(code as LanguageCode)}
                accessibilityRole="button"
                accessibilityLabel={t('languagePicker.selectLanguage', { language: lang.name })}
              >
                <Text style={[
                  styles.languageName,
                  isDark && styles.textDark,
                  i18n.language === code && styles.languageNameSelected,
                ]}>
                  {lang.name}
                </Text>
                <Text style={[
                  styles.languageNative,
                  isDark && styles.textLightDark,
                  i18n.language === code && styles.languageNativeSelected,
                ]}>
                  {lang.nativeName}
                </Text>
                {i18n.language === code && (
                  <View style={[styles.checkmark, isDark && styles.checkmarkDark]}>
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color={isDark ? '#111827' : '#FFFFFF'} 
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, isDark && styles.continueButtonDark]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('languagePicker.continue')}
          >
            <Text style={styles.continueButtonText}>
              {t('languagePicker.continue')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  contentDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  languagesContainer: {
    marginBottom: 24,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  languageButtonDark: {
    backgroundColor: '#374151',
  },
  languageButtonSelected: {
    backgroundColor: '#DCF5E3',
  },
  languageButtonSelectedDark: {
    backgroundColor: '#065F46',
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  languageNameSelected: {
    color: '#047857',
  },
  languageNative: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  languageNativeSelected: {
    color: '#047857',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkDark: {
    backgroundColor: '#A3E635',
  },
  continueButton: {
    backgroundColor: '#45B36B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDark: {
    backgroundColor: '#A3E635',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textDark: {
    color: '#F3F4F6',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
}); 