import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AnalyticsService from '../services/analytics';
import { MIXPANEL_TOKEN } from '@env';

interface AnalyticsContextValue {
  initialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  initialized: false,
});

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = React.useState(false);
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await analytics.init(MIXPANEL_TOKEN);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    };

    initializeAnalytics();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        analytics.startNewSession();
      } else if (nextAppState === 'background') {
        analytics.endSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <AnalyticsContext.Provider value={{ initialized }}>{children}</AnalyticsContext.Provider>;
};

export const useAnalyticsContext = () => useContext(AnalyticsContext);
