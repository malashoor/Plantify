import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { LANGUAGES, type LanguageCode, changeLanguage } from '../../utils/i18n';
import { Ionicons } from '@expo/vector-icons';

interface LanguageSelectorProps {
  variant?: 'pills' | 'buttons' | 'minimal';
  showIcon?: boolean;
  onLanguageChange?: (lng: LanguageCode) => void;
}

export default function LanguageSelector({
  variant = 'pills',
  showIcon = true,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentLanguage = i18n.language as LanguageCode;

  const handleLanguageChange = async (lng: LanguageCode) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.selectionAsync();
      }
      await changeLanguage(lng);
      onLanguageChange?.(lng);
      
      // Announce language change to screen readers
      const selectedLang = LANGUAGES[lng];
      const message = t('accessibility.language_changed', {
        language: selectedLang.name,
        nativeName: selectedLang.nativeName
      });
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.minimalButton, isDark && styles.minimalButtonDark]}
        onPress={() => handleLanguageChange(currentLanguage === 'en' ? 'ar' : 'en')}
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.switch_language', {
          from: LANGUAGES[currentLanguage].name,
          to: LANGUAGES[currentLanguage === 'en' ? 'ar' : 'en'].name
        })}
        accessibilityHint={t('accessibility.language_switch_hint')}
      >
        <Text style={[styles.minimalButtonText, isDark && styles.textDark]}>
          {currentLanguage === 'en' ? 'عربي' : 'EN'}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'buttons') {
    return (
      <View 
        style={styles.buttonContainer}
        accessible={true}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('accessibility.language_selector')}
      >
        {showIcon && (
          <Ionicons 
            name="language" 
            size={24} 
            color={isDark ? '#A3E635' : '#2E7D32'} 
            style={styles.icon}
          />
        )}
        <View style={styles.buttonGroup}>
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.button,
                currentLanguage === code && styles.buttonSelected,
                isDark && styles.buttonDark,
              ]}
              onPress={() => handleLanguageChange(code as LanguageCode)}
              accessibilityRole="radio"
              accessibilityLabel={lang.name}
              accessibilityState={{ checked: currentLanguage === code }}
              accessibilityHint={t('accessibility.language_button_hint', {
                language: lang.name
              })}
            >
              <Text
                style={[
                  styles.buttonText,
                  currentLanguage === code && styles.buttonTextSelected,
                  isDark && styles.textDark,
                ]}
              >
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Default: Pills variant
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('accessibility.language_selector')}
    >
      {showIcon && (
        <View style={styles.labelContainer}>
          <Ionicons 
            name="language" 
            size={24} 
            color={isDark ? '#A3E635' : '#2E7D32'} 
          />
          <Text style={[styles.label, isDark && styles.textDark]}>
            {t('profile.settings.language')}
          </Text>
        </View>
      )}
      <View style={styles.pillsContainer}>
        {Object.entries(LANGUAGES).map(([code, lang]) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.pill,
              currentLanguage === code && styles.pillSelected,
              isDark && styles.pillDark,
            ]}
            onPress={() => handleLanguageChange(code as LanguageCode)}
            accessibilityRole="radio"
            accessibilityLabel={lang.name}
            accessibilityState={{ checked: currentLanguage === code }}
            accessibilityHint={t('accessibility.language_pill_hint', {
              language: lang.name
            })}
          >
            <Text
              style={[
                styles.pillText,
                currentLanguage === code && styles.pillTextSelected,
                isDark && styles.textDark,
              ]}
            >
              {lang.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  pillDark: {
    backgroundColor: '#374151',
  },
  pillSelected: {
    backgroundColor: '#2E7D32',
  },
  pillText: {
    fontSize: 14,
    color: '#111827',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonContainer: {
    marginVertical: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#374151',
  },
  buttonSelected: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    fontSize: 14,
    color: '#111827',
  },
  buttonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  minimalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  minimalButtonDark: {
    backgroundColor: '#374151',
  },
  minimalButtonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  icon: {
    marginBottom: 8,
  },
  textDark: {
    color: '#FFFFFF',
  },
}); 