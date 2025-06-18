import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@contexts/ThemeContext';
import { AccessibilityProvider } from '@contexts/AccessibilityContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@lib/i18n';
import Navigation from '@navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <AccessibilityProvider>
            <StatusBar style="auto" />
            <Navigation />
          </AccessibilityProvider>
        </I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
