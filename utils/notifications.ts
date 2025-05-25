import { Platform } from 'react-native';
import type {
  PermissionStatus,
  NotificationTriggerInput,
  NotificationContentInput,
  NotificationRequest,
  NotificationResponse
} from 'expo-notifications';
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // Only loads on native
  // eslint-disable-next-line import/no-extraneous-dependencies
  Notifications = require('expo-notifications');
}
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase } from './supabase';

// Channel IDs
export enum NotificationChannel {
  REMINDERS = 'reminders', // Time-based reminders (watering, fertilizing)
  ALERTS = 'alerts',       // Sensor-based alerts (low water, pH out of range)
  ACHIEVEMENTS = 'achievements', // Achievement notifications
  MARKETING = 'marketing'  // Marketing and engagement messages
}

// Define notification importance levels
export enum NotificationImportance {
  DEFAULT = Notifications.AndroidImportance.DEFAULT,
  HIGH = Notifications.AndroidImportance.HIGH,
  MAX = Notifications.AndroidImportance.MAX,
  LOW = Notifications.AndroidImportance.LOW,
  MIN = Notifications.AndroidImportance.MIN
}

// Define notification interaction types
export enum NotificationInteraction {
  TAP = 'tap',
  DISMISS = 'dismiss',
  SNOOZE = 'snooze',
  ACTION = 'action'
}

// Notification template object
export interface NotificationTemplate {
  title: string;
  body: string;
  data?: Record<string, any>;
  categoryId?: string;
  sound?: boolean;
  badge?: boolean;
  channelId: NotificationChannel;
  importance?: NotificationImportance;
  // iOS 18+ specific
  relevanceScore?: number;
  interruptionLevel?: Notifications.IOSInterruptionLevel;
  actions?: {
    identifier: string;
    buttonTitle: string;
    options?: {
      isDestructive?: boolean;
      isAuthenticationRequired?: boolean;
      opensAppToForeground?: boolean;
    };
  }[];
}

// Permission status tracking
export interface NotificationPermissionStatus {
  status: Notifications.PermissionStatus;
  lastPrompted: number;
  hasShownInlinePrompt: boolean;
  wasExplicitlyDenied: boolean;
}

// Storage keys
const PERMISSION_STATUS_KEY = 'notification_permission_status';
const PERMISSION_CONTEXT_SHOWN = 'notification_context_shown';

/**
 * Set up notification channels for Android devices
 */
export const setupNotificationChannels = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    // Time-based reminders (standard priority)
    await Notifications.setNotificationChannelAsync(NotificationChannel.REMINDERS, {
      name: 'Care reminders',
      description: 'Reminders for plant care like watering and fertilizing',
      importance: NotificationImportance.DEFAULT,
      sound: true,
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
    });

    // Sensor-based alerts (high priority)
    await Notifications.setNotificationChannelAsync(NotificationChannel.ALERTS, {
      name: 'Sensor alerts',
      description: 'Urgent alerts about plant conditions from sensors',
      importance: NotificationImportance.HIGH,
      sound: true,
      enableVibrate: true,
      vibrationPattern: [0, 250, 100, 250],
      lightColor: '#D32F2F',
    });

    // Achievement notifications (low priority)
    await Notifications.setNotificationChannelAsync(NotificationChannel.ACHIEVEMENTS, {
      name: 'Achievements',
      description: 'Plant care milestones and achievements',
      importance: NotificationImportance.LOW,
      sound: true,
      enableVibrate: false,
    });

    // Marketing messages (min priority)
    await Notifications.setNotificationChannelAsync(NotificationChannel.MARKETING, {
      name: 'Updates and tips',
      description: 'Tips, features, and app updates',
      importance: NotificationImportance.MIN,
      sound: false,
      enableVibrate: false,
    });
  }
};

/**
 * Set up notification categories with actions
 */
export const setupNotificationCategories = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync('reminder', [
    {
      identifier: 'snooze-1h',
      buttonTitle: 'Snooze 1h',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'mark-done',
      buttonTitle: 'Mark as done',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
  ]);

  await Notifications.setNotificationCategoryAsync('alert', [
    {
      identifier: 'view-details',
      buttonTitle: 'View details',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: {
        isDestructive: true,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
  ]);
};

/**
 * Register for push notifications with permission management
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications not available on simulator/emulator');
    return null;
  }

  // Set up the notification handler
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Set up notification channels (Android only)
  await setupNotificationChannels();
  
  // Set up notification categories (actions)
  await setupNotificationCategories();

  // Get the existing device push token if available
  const { data: existingToken } = await Notifications.getDevicePushTokenAsync();
  
  if (existingToken) {
    return existingToken.data;
  }

  // Get a new push token
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  // Store the token in AsyncStorage
  await AsyncStorage.setItem('pushToken', token);

  // Platform-specific setup
  if (Platform.OS === 'android') {
    // Required for Android to show notifications when app is in the foreground
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: NotificationImportance.MAX,
    });
  }

  return token;
};

/**
 * Show context-aware notification permission prompt
 * @param context The context in which we're requesting permission (e.g., 'grow-cycle', 'sensor-alerts')
 * @param feature Name of the feature for which we need notifications
 * @returns Permission status
 */
export const requestNotificationPermissionWithContext = async (
  context: string,
  feature: string
): Promise<Notifications.PermissionStatus> => {
  try {
    // Check if we've shown a context-specific message for this context
    const shownContextsJSON = await AsyncStorage.getItem(PERMISSION_CONTEXT_SHOWN);
    const shownContexts = shownContextsJSON ? JSON.parse(shownContextsJSON) : {};
    
    const hasShownThisContext = shownContexts[context];
    
    // Get the current permission status
    const existingStatus = await getNotificationPermissionStatus();
    
    // If already granted, no need to proceed
    if (existingStatus.status === Notifications.PermissionStatus.GRANTED) {
      return Notifications.PermissionStatus.GRANTED;
    }
    
    // If not granted but we haven't shown this context yet
    if (!hasShownThisContext) {
      // Mark this context as shown
      shownContexts[context] = true;
      await AsyncStorage.setItem(PERMISSION_CONTEXT_SHOWN, JSON.stringify(shownContexts));
      
      // Show contextual dialog first
      const shouldProceed = await new Promise<boolean>(resolve => {
        Alert.alert(
          `Enable ${feature} reminders?`,
          `PlantAI can notify you about important ${context} events to help your plants thrive.`,
          [
            {
              text: 'Not now',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Enable',
              onPress: () => resolve(true),
            },
          ],
          { cancelable: false }
        );
      });
      
      if (!shouldProceed) {
        return existingStatus.status;
      }
    }
    
    // Proceed with the actual permission request
    const { status } = await Notifications.requestPermissionsAsync();
    
    // Save the updated status
    await saveNotificationPermissionStatus({
      status,
      lastPrompted: Date.now(),
      hasShownInlinePrompt: existingStatus.hasShownInlinePrompt,
      wasExplicitlyDenied: status === Notifications.PermissionStatus.DENIED,
    });
    
    return status;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Notifications.PermissionStatus.UNDETERMINED;
  }
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermissionStatus = async (): Promise<NotificationPermissionStatus> => {
  try {
    // Try to get saved permission status
    const savedStatusJSON = await AsyncStorage.getItem(PERMISSION_STATUS_KEY);
    
    if (savedStatusJSON) {
      const savedStatus = JSON.parse(savedStatusJSON);
      return savedStatus;
    }
    
    // If no saved status, get current status
    const { status } = await Notifications.getPermissionsAsync();
    
    const newStatus: NotificationPermissionStatus = {
      status,
      lastPrompted: 0, // Never prompted before
      hasShownInlinePrompt: false,
      wasExplicitlyDenied: false,
    };
    
    // Save this initial status
    await saveNotificationPermissionStatus(newStatus);
    
    return newStatus;
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    
    // Return a default status if there was an error
    return {
      status: Notifications.PermissionStatus.UNDETERMINED,
      lastPrompted: 0,
      hasShownInlinePrompt: false,
      wasExplicitlyDenied: false,
    };
  }
};

/**
 * Save notification permission status
 */
export const saveNotificationPermissionStatus = async (
  status: NotificationPermissionStatus
): Promise<void> => {
  await AsyncStorage.setItem(PERMISSION_STATUS_KEY, JSON.stringify(status));
};

/**
 * Schedule a notification based on a template
 */
export const scheduleNotification = async (
  template: NotificationTemplate,
  trigger: Notifications.NotificationTriggerInput
): Promise<string> => {
  try {
    const content: Notifications.NotificationContentInput = {
      title: template.title,
      body: template.body,
      data: {
        ...template.data,
        channelId: template.channelId,
        // Add timestamp for analytics
        timestamp: new Date().toISOString(),
      },
      sound: template.sound !== false,
      badge: template.badge !== false,
      // iOS 18+ Apple Intelligence support
      ...(Platform.OS === 'ios' && {
        interruptionLevel: template.interruptionLevel || Notifications.IOSInterruptionLevel.ACTIVE,
        relevanceScore: template.relevanceScore || 0.5,
      }),
    };

    if (template.categoryId) {
      content.categoryIdentifier = template.categoryId;
    }

    if (Platform.OS === 'android') {
      content.channelId = template.channelId;
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Log notification interaction in Supabase
 */
export const logNotificationInteraction = async (
  notificationId: string,
  action: NotificationInteraction,
  userId?: string,
  additionalData?: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_interactions')
      .insert([
        {
          user_id: userId || 'anonymous',
          notification_id: notificationId,
          action,
          additional_data: additionalData,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error logging notification interaction:', error);
  }
};

/**
 * Handle notification response (when user interacts with a notification)
 */
export const handleNotificationResponse = async (
  response: Notifications.NotificationResponse
): Promise<void> => {
  // Extract information from the response
  const { notification, actionIdentifier, userText } = response;
  const { request } = notification;
  const { identifier, content } = request;
  const { data } = content;

  // Determine the interaction type
  let action: NotificationInteraction;
  
  if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    action = NotificationInteraction.TAP;
  } else if (actionIdentifier === 'snooze-1h') {
    action = NotificationInteraction.SNOOZE;
  } else if (actionIdentifier === 'dismiss') {
    action = NotificationInteraction.DISMISS;
  } else {
    action = NotificationInteraction.ACTION;
  }

  // Log the interaction
  await logNotificationInteraction(identifier, action, data.userId, {
    actionIdentifier,
    userText,
    timestamp: new Date().toISOString(),
  });

  // Handle specific actions
  if (action === NotificationInteraction.SNOOZE) {
    // Re-schedule the notification for 1 hour later
    const newTrigger = { seconds: 60 * 60 }; // 1 hour
    
    if (data.template) {
      await scheduleNotification(data.template, newTrigger);
    }
  }
};

// Register notification response handler
export const registerNotificationHandlers = (): void => {
  // When the app is in the foreground
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
    // You could play a custom sound, show an in-app notification, etc.
  });

  // When the user interacts with a notification
  Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response);
  });
}; 