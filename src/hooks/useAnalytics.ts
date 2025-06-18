import { useEffect, useCallback, useState } from 'react';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { AnalyticsEvent, AnalyticsProperties, AnalyticsUserProfile } from '../types/analytics';
import AnalyticsService from '../services/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/analytics/AnalyticsService';

const analytics = AnalyticsService.getInstance();
const ANALYTICS_OPT_OUT_KEY = '@analytics_opt_out';

interface AnalyticsHookReturn {
  trackEvent: (event: string, props?: Record<string, any>) => Promise<void>;
  setOptOut: (value: boolean) => Promise<void>;
  isEnabled: boolean;
}

export const useAnalytics = (): AnalyticsHookReturn => {
  const navigation = useNavigation();
  const navState = useNavigationState(state => state);
  const [isOptedOut, setIsOptedOut] = useState(false);

  // Initialize opt-out state
  useEffect(() => {
    AsyncStorage.getItem(ANALYTICS_OPT_OUT_KEY)
      .then(value => setIsOptedOut(value === 'true'))
      .catch(() => setIsOptedOut(false));
  }, []);

  // Track screen views
  useEffect(() => {
    if (isOptedOut) return;

    const unsubscribe = navigation.addListener('state', () => {
      const currentRoute = navigation.getCurrentRoute();
      if (currentRoute) {
        analytics.trackScreen(currentRoute.name);
      }
    });

    return unsubscribe;
  }, [navigation, isOptedOut]);

  // Identify user
  const identifyUser = useCallback(async (userId: string, userProfile: AnalyticsUserProfile) => {
    await analytics.identifyUser(userId, userProfile);
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (profile: AnalyticsUserProfile) => {
    await analytics.updateUserProfile(profile);
  }, []);

  // Track events
  const trackEvent = useCallback(
    async (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
      await analytics.trackEvent(event, properties);
    },
    []
  );

  // Track feature usage
  const trackFeature = useCallback(
    async (featureName: string, properties?: AnalyticsProperties) => {
      return analytics.trackFeatureUsage(featureName, properties);
    },
    []
  );

  // Track errors
  const trackError = useCallback(async (error: Error, properties?: AnalyticsProperties) => {
    await analytics.trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
      ...properties,
      error_type: error.name,
      error_message: error.message,
      error_stack: error.stack,
    });
  }, []);

  // Track subscription events
  const trackSubscription = useCallback(
    async (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
      await analytics.trackSubscriptionEvent(event, properties);
    },
    []
  );

  // Track revenue
  const trackRevenue = useCallback(async (amount: number, properties?: AnalyticsProperties) => {
    await analytics.trackRevenue(amount, properties);
  }, []);

  // Opt-out management
  const setOptOut = useCallback(async (optOut: boolean) => {
    await analytics.setOptOut(optOut);
    setIsOptedOut(optOut);
  }, []);

  useEffect(() => {
    const route = navState?.routes[navState.index]?.name;
    if (route) {
      analytics.trackScreen(route);
    }
  }, [navState]);

  return {
    isOptedOut,
    setOptOut,
    identifyUser,
    updateUserProfile,
    trackEvent,
    trackFeature,
    trackError,
    trackSubscription,
    trackRevenue,
    isEnabled: analytics.isEnabled(),
  };
};
