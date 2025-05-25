import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { createContext, useContext } from 'react';


// Import translations
import ar from '@/translations/ar';
import en from '@/translations/en';
import { I18nManager } from 'react-native';

// Create i18n instance
const i18n = new I18n({
  en,
  ar,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.locale.split('-')[0];
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Setup RTL for Arabic
export const setupI18n = () => {
  const isRTL = i18n.locale === 'ar';
  I18nManager.forceRTL(isRTL);
  return i18n;
};

// Create a context for the i18n instance
export const I18nContext = createContext<{
  t: (scope: string, options?: any) => string;
  i18n: I18n;
}>({
  t: (scope: string, options?: any) => i18n.t(scope, options),
  i18n,
});

// Create a hook to use the i18n instance
export const useTranslation = () => {
  const context = useContext(I18nContext);
  return {
    t: context.t,
    i18n: context.i18n,
  };
};

export default i18n;
