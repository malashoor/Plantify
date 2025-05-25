declare module 'expo-notifications' {
  import { Subscription } from 'expo-modules-core';

  export interface NotificationRequestInput {
    content: {
      title: string;
      body: string;
      data?: Record<string, any>;
    };
    trigger?: {
      seconds?: number;
      date?: Date;
      channelId?: string;
    };
  }

  export interface NotificationResponse {
    notification: {
      request: {
        content: {
          title: string;
          body: string;
          data?: Record<string, any>;
        };
      };
    };
  }

  export function scheduleNotificationAsync(
    request: NotificationRequestInput
  ): Promise<string>;

  export function cancelScheduledNotificationAsync(
    identifier: string
  ): Promise<void>;

  export function addNotificationReceivedListener(
    listener: (response: NotificationResponse) => void
  ): Subscription;

  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void
  ): Subscription;

  export function removeNotificationSubscription(
    subscription: Subscription
  ): void;
} 