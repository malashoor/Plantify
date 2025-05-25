import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple translation resources
const resources = {
  en: {
    translation: {
      home: {
        greeting: 'Welcome to Platify!',
        scanPlant: 'Scan Plant',
        scanPlantHint: 'Use camera to identify plants',
        addPlant: 'Add Plant',
        addPlantHint: 'Manually add a new plant',
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
      },
    },
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // react already does escaping
    },
  });

export default i18n;

// Export useTranslation hook for components
export const useTranslation = () => {
  return {
    t: (key: string) => {
      // Simple implementation - split key by dots and navigate
      const keys = key.split('.');
      let value: any = {
        tabs: {
          home: 'Home',
          plants: 'Plants', 
          tasks: 'Tasks',
          insights: 'Insights',
          settings: 'Settings',
          sensorRules: 'Sensor Rules',
        },
        accessibility: {
          homeTab: 'Home tab',
          plantsTab: 'Plants tab',
          tasksTab: 'Tasks tab', 
          insightsTab: 'Insights tab',
          settingsTab: 'Settings tab',
          sensorRulesTab: 'Sensor Rules tab',
        },
      };
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    }
  };
}; 