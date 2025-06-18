import { Mixpanel } from 'mixpanel-react-native';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { 
  AnalyticsEvent, 
  AnalyticsProperties, 
  AnalyticsUserProfile,
  UserProperty 
} from '../../types/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_OPT_OUT_KEY = '@analytics_opt_out';

class AnalyticsService {
  private static instance: AnalyticsService;
  private mixpanel: Mixpanel;
  private initialized: boolean = false;
  private userId: string | null = null;
  private sessionStartTime: number = Date.now();
  private currentScreen: string | null = null;
  private isOptedOut: boolean = false;

  private constructor() {
    // Initialize in init() method
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async init(token: string): Promise<void> {
    if (this.initialized) return;

    // Check opt-out status
    this.isOptedOut = await this.getOptOutStatus();

    this.mixpanel = await Mixpanel.init(token);
    this.initialized = true;

    // Set default properties
    this.mixpanel.setServerURL("https://api.mixpanel.com");
    
    // Track app version and platform
    await this.setDefaultProperties();

    // Apply opt-out if needed
    if (this.isOptedOut) {
      await this.mixpanel.optOutTracking();
    }
  }

  private async setDefaultProperties(): Promise<void> {
    const properties = {
      [UserProperty.PLATFORM]: Platform.OS,
      [UserProperty.APP_VERSION]: await DeviceInfo.getVersion(),
      [UserProperty.DEVICE_TYPE]: await DeviceInfo.getDeviceType(),
      device_name: await DeviceInfo.getDeviceName(),
      os_version: Platform.Version
    };

    await this.mixpanel.registerSuperProperties(properties);
  }

  async identifyUser(userId: string, userProfile: AnalyticsUserProfile): Promise<void> {
    if (!this.initialized || this.isOptedOut) return;

    this.userId = userId;
    await this.mixpanel.identify(userId);

    const profile = {
      $distinct_id: userId,
      ...userProfile,
      [UserProperty.PLATFORM]: Platform.OS,
      [UserProperty.APP_VERSION]: await DeviceInfo.getVersion(),
      last_updated: new Date().toISOString()
    };

    await this.mixpanel.getPeople().set(profile);
  }

  async updateUserProfile(profile: AnalyticsUserProfile): Promise<void> {
    if (!this.userId || !this.initialized || this.isOptedOut) return;

    const userProfile = {
      $distinct_id: this.userId,
      ...profile,
      [UserProperty.PLATFORM]: Platform.OS,
      [UserProperty.APP_VERSION]: await DeviceInfo.getVersion(),
      last_updated: new Date().toISOString()
    };

    await this.mixpanel.getPeople().set(userProfile);
  }

  async trackEvent(
    event: AnalyticsEvent,
    properties: AnalyticsProperties = {}
  ): Promise<void> {
    if (!this.initialized || this.isOptedOut) return;

    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: this.sessionStartTime,
      current_screen: this.currentScreen
    };

    if (this.userId) {
      enrichedProperties.user_id = this.userId;
    }

    await this.mixpanel.track(event, enrichedProperties);

    // If this is a critical event that needs server-side audit
    if (this.isCriticalEvent(event)) {
      await this.relayEventToServer(event, enrichedProperties);
    }
  }

  private isCriticalEvent(event: AnalyticsEvent): boolean {
    return [
      AnalyticsEvent.SUBSCRIPTION_START,
      AnalyticsEvent.SUBSCRIPTION_CANCEL,
      AnalyticsEvent.PAYMENT_ERROR,
      AnalyticsEvent.CRITICAL_ERROR
    ].includes(event);
  }

  private async relayEventToServer(
    event: AnalyticsEvent,
    properties: AnalyticsProperties
  ): Promise<void> {
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event, properties })
      });

      if (!response.ok) {
        console.error('Failed to relay event to server:', await response.text());
      }
    } catch (error) {
      console.error('Error relaying event to server:', error);
    }
  }

  async trackScreen(
    screenName: string,
    properties: AnalyticsProperties = {}
  ): Promise<void> {
    if (!this.initialized || this.isOptedOut) return;

    const previousScreen = this.currentScreen;
    this.currentScreen = screenName;

    await this.trackEvent(AnalyticsEvent.SCREEN_VIEW, {
      ...properties,
      screen_name: screenName,
      previous_screen: previousScreen
    });
  }

  // Opt-out management
  async setOptOut(optOut: boolean): Promise<void> {
    this.isOptedOut = optOut;
    await AsyncStorage.setItem(ANALYTICS_OPT_OUT_KEY, JSON.stringify(optOut));
    
    if (this.initialized) {
      if (optOut) {
        await this.mixpanel.optOutTracking();
      } else {
        await this.mixpanel.optInTracking();
      }
    }
  }

  private async getOptOutStatus(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ANALYTICS_OPT_OUT_KEY);
      return value ? JSON.parse(value) : false;
    } catch {
      return false;
    }
  }

  // Subscription tracking
  async trackSubscriptionEvent(
    event: AnalyticsEvent,
    properties: AnalyticsProperties = {}
  ): Promise<void> {
    if (!this.userId) return;

    const subscriptionProperties = {
      ...properties,
      subscription_status: properties.subscription_status,
      subscription_tier: properties.subscription_tier,
      revenue: properties.amount
    };

    await this.trackEvent(event, subscriptionProperties);

    // Update user profile with subscription info
    if (event === AnalyticsEvent.SUBSCRIPTION_START) {
      await this.updateUserProfile({
        [UserProperty.SUBSCRIPTION_STATUS]: properties.subscription_status,
        [UserProperty.SUBSCRIPTION_TIER]: properties.subscription_tier
      });
    }
  }

  // Revenue tracking
  async trackRevenue(
    amount: number,
    properties: AnalyticsProperties = {}
  ): Promise<void> {
    if (!this.userId) return;

    await this.mixpanel.getPeople().trackCharge(amount, properties);
  }

  // Engagement tracking
  async updateEngagementScore(score: number): Promise<void> {
    if (!this.userId) return;

    await this.updateUserProfile({
      [UserProperty.ENGAGEMENT_SCORE]: score
    });
  }

  // Session management
  startNewSession(): void {
    this.sessionStartTime = Date.now();
    this.trackEvent(AnalyticsEvent.APP_OPEN);
  }

  async endSession(): Promise<void> {
    const sessionDuration = Date.now() - this.sessionStartTime;
    await this.trackEvent(AnalyticsEvent.APP_BACKGROUND, {
      session_duration_ms: sessionDuration
    });
  }

  // Reset analytics (for logout)
  async reset(): Promise<void> {
    this.userId = null;
    this.currentScreen = null;
    await this.mixpanel.reset();
  }
}

export default AnalyticsService; 