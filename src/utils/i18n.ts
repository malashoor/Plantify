import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

import en from '../../translations/en';
import ar from '../../translations/ar';
import es from '../../translations/es';
import fr from '../../translations/fr';
import hi from '../../translations/hi';
import zh from '../../translations/zh';
import ja from '../../translations/ja';
import ko from '../../translations/ko';
import de from '../../translations/de';

export const LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
  },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  de: { translation: de },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: Localization.locale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language on startup
AsyncStorage.getItem('user-language').then((language) => {
  if (language && Object.keys(LANGUAGES).includes(language)) {
    i18n.changeLanguage(language);
    I18nManager.forceRTL(LANGUAGES[language as LanguageCode].direction === 'rtl');
  }
});

// Helper function to change language
export const changeLanguage = async (lng: LanguageCode) => {
  try {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('user-language', lng);
    const isRTL = LANGUAGES[lng].direction === 'rtl';
    
    // Only reload if RTL setting changed
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

export { i18n };
export default i18n; 