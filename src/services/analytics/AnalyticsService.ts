import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mixpanel } from 'mixpanel-react-native';
import DeviceInfo from 'react-native-device-info';

const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '';

interface AnalyticsProperties {
  [key: string]: any;
}

class AnalyticsService {
  private mixpanel: Mixpanel;
  private enabled: boolean;
  private initialized: boolean;

  constructor() {
    this.mixpanel = new Mixpanel(MIXPANEL_TOKEN);
    this.enabled = true;
    this.initialized = false;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.mixpanel.init();
      const optOut = await AsyncStorage.getItem('analytics_opt_out');
      this.enabled = optOut !== 'true';
      await this.mixpanel.optOutTracking(this.enabled);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      this.enabled = false;
    }
  }

  async identify(userId: string): Promise<void> {
    if (!this.enabled || !this.initialized) return;
    
    try {
      await this.mixpanel.identify(userId);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  async track(event: string, props: AnalyticsProperties = {}): Promise<void> {
    if (!this.enabled || !this.initialized) return;
    
    try {
      await this.mixpanel.track(event, {
        ...props,
        device_id: DeviceInfo.getUniqueIdSync(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async setOptOut(value: boolean): Promise<void> {
    this.enabled = !value;
    await AsyncStorage.setItem('analytics_opt_out', value ? 'true' : 'false');
    
    if (this.initialized) {
      await this.mixpanel.optOutTracking(value);
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.initialized;
  }
}

export const analyticsService = new AnalyticsService(); 