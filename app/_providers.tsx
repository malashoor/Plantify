import React, { useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nContext, useTranslation, setupI18n } from '@/utils/i18n';
import { Platform } from 'react-native';
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // Only loads on native
  // eslint-disable-next-line import/no-extraneous-dependencies
  Notifications = require('expo-notifications');
}

import { devToolsConfig } from '../utils/react-query';
import WebCompatibilityWrapper from './components/WebCompatibilityWrapper';

// Initialize QueryClient
const queryClient = new QueryClient();

// Set up notification handlers
// Only set up in native platforms to avoid web errors
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const i18n = useTranslation();

  useEffect(() => {
    // Set up i18n
    setupI18n();
    
    // Set up notification handlers - only in native environments
    if (Platform.OS !== 'web') {
      registerNotificationHandlers();
    }
  }, []);

  // Use the WebCompatibilityWrapper on web to detect any issues
  const content = Platform.OS === 'web' 
    ? <WebCompatibilityWrapper>{children}</WebCompatibilityWrapper>
    : children;

  return (
    <QueryClientProvider client={queryClient}>
      <I18nContext.Provider value={i18n}>
        {content}
      </I18nContext.Provider>
      {devToolsConfig.enabled && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position={devToolsConfig.position}
        />
      )}
    </QueryClientProvider>
  );
}
