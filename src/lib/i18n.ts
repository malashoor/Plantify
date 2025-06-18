import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import your translation files
const en = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  home: {
    title: 'Home',
    welcome: 'Welcome to PlantAI',
  },
  weather: {
    title: 'Weather',
    temperature: 'Temperature',
    humidity: 'Humidity',
    precipitation: 'Precipitation',
  },
};

const resources = {
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n; 