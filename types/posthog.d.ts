/**
 * Type declarations for PostHog analytics
 */

interface PostHogAPI {
  capture(eventName: string, properties?: Record<string, unknown>): void;
  identify(distinctId?: string, userProperties?: Record<string, unknown>): void;
  reset(): void;
  init(apiKey: string, options?: Record<string, unknown>): void;
  isFeatureEnabled(key: string): boolean;
  getFeatureFlag(key: string): string | boolean;
  debug(enabled?: boolean): void;
}

declare global {
  interface Window {
    posthog?: PostHogAPI;
  }
}

export {}; 