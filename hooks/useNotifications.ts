import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import type {
  PermissionStatus,
  NotificationTriggerInput,
  NotificationRequest
} from 'expo-notifications';
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // Only loads on native
  // eslint-disable-next-line import/no-extraneous-dependencies
  Notifications = require('expo-notifications');
}
import { useAuth } from './useAuth';
import { useTranslation } from '@/utils/i18n';
import {
  NotificationChannel,
  NotificationTemplate,
  NotificationInteraction,
  registerForPushNotifications,
  requestNotificationPermissionWithContext,
  scheduleNotification,
  logNotificationInteraction,
  getNotificationPermissionStatus,
  registerNotificationHandlers,
} from '@/utils/notifications';

export interface ReminderOptions {
  plantId?: string;
  plantName?: string;
  taskId?: string;
  taskType?: string;
  dueDate?: string;
}

export interface AlertOptions {
  systemId?: string;
  systemName?: string;
  alertType?: string;
  severity?: 'low' | 'medium' | 'high';
  reading?: number;
  unit?: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  categoryId?: string;
  sound?: boolean;
}

export const useNotifications = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize notifications
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Register notification handlers
        registerNotificationHandlers();
        
        // Get current permission status
        const permStatus = await getNotificationPermissionStatus();
        setPermissionStatus(permStatus.status);
        
        // Get push token if permissions are granted
        if (permStatus.status === Notifications?.PermissionStatus.GRANTED) {
          const token = await registerForPushNotifications();
          setPushToken(token);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Request notification permissions with context
  const requestPermissions = useCallback(async (
    context: string,
    feature: string
  ): Promise<boolean> => {
    try {
      const status = await requestNotificationPermissionWithContext(context, feature);
      setPermissionStatus(status);
      
      if (status === Notifications?.PermissionStatus.GRANTED) {
        const token = await registerForPushNotifications();
        setPushToken(token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  // Schedule a plant care reminder
  const scheduleReminder = useCallback(async (
    options: NotificationOptions & ReminderOptions,
    trigger: NotificationTriggerInput
  ): Promise<string | null> => {
    try {
      if (permissionStatus !== Notifications?.PermissionStatus.GRANTED) {
        const granted = await requestPermissions('grow-cycle', 'plant care');
        if (!granted) return null;
      }
      
      const template: NotificationTemplate = {
        title: options.title,
        body: options.body,
        data: {
          ...options.data,
          userId: user?.id,
          plantId: options.plantId,
          plantName: options.plantName,
          taskId: options.taskId,
          taskType: options.taskType,
          dueDate: options.dueDate,
          screen: options.plantId ? `plant/${options.plantId}` : 'tasks',
          template: { ...options, channelId: NotificationChannel.REMINDERS },
        },
        channelId: NotificationChannel.REMINDERS,
        sound: options.sound !== false,
        badge: true,
        categoryId: 'reminder',
        // Moderate relevance score for iOS 18+
        relevanceScore: 0.7,
        interruptionLevel: (Notifications as any)?.IOSInterruptionLevel?.ACTIVE || undefined,
      };
      
      return await scheduleNotification(template, trigger);
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
      return null;
    }
  }, [permissionStatus, requestPermissions, user]);

  // Schedule a sensor alert notification
  const scheduleSensorAlert = useCallback(async (
    options: NotificationOptions & AlertOptions,
    trigger: NotificationTriggerInput = null
  ): Promise<string | null> => {
    try {
      if (permissionStatus !== Notifications?.PermissionStatus.GRANTED) {
        const granted = await requestPermissions('sensor-alerts', 'system alerts');
        if (!granted) return null;
      }
      
      const template: NotificationTemplate = {
        title: options.title,
        body: options.body,
        data: {
          ...options.data,
          userId: user?.id,
          systemId: options.systemId,
          systemName: options.systemName,
          alertType: options.alertType,
          severity: options.severity,
          reading: options.reading,
          unit: options.unit,
          screen: options.systemId ? `systems/${options.systemId}` : 'systems',
          template: { ...options, channelId: NotificationChannel.ALERTS },
        },
        channelId: NotificationChannel.ALERTS,
        sound: options.sound !== false,
        badge: true,
        categoryId: 'alert',
        // High relevance score for iOS 18+
        relevanceScore: 0.9,
        interruptionLevel: (Notifications as any)?.IOSInterruptionLevel?.TIMESENSITIVE || undefined,
      };
      
      // Use immediate trigger if none provided
      const actualTrigger = trigger || null;
      
      return await scheduleNotification(template, actualTrigger);
    } catch (error) {
      console.error('Error scheduling alert notification:', error);
      return null;
    }
  }, [permissionStatus, requestPermissions, user]);

  // Schedule an achievement notification
  const scheduleAchievement = useCallback(async (
    options: NotificationOptions,
    trigger: NotificationTriggerInput = null
  ): Promise<string | null> => {
    try {
      if (permissionStatus !== Notifications?.PermissionStatus.GRANTED) {
        const granted = await requestPermissions('achievements', 'achievement updates');
        if (!granted) return null;
      }
      
      const template: NotificationTemplate = {
        title: options.title,
        body: options.body,
        data: {
          ...options.data,
          userId: user?.id,
          screen: 'profile',
          template: { ...options, channelId: NotificationChannel.ACHIEVEMENTS },
        },
        channelId: NotificationChannel.ACHIEVEMENTS,
        sound: options.sound !== false,
        badge: false,
        categoryId: options.categoryId,
        // Low relevance score for iOS 18+
        relevanceScore: 0.4,
        interruptionLevel: (Notifications as any)?.IOSInterruptionLevel?.PASSIVE || undefined,
      };
      
      // Use immediate trigger if none provided
      const actualTrigger = trigger || null;
      
      return await scheduleNotification(template, actualTrigger);
    } catch (error) {
      console.error('Error scheduling achievement notification:', error);
      return null;
    }
  }, [permissionStatus, requestPermissions, user]);

  // Cancel a scheduled notification
  const cancelNotification = useCallback(async (
    notificationId: string
  ): Promise<boolean> => {
    try {
      await Notifications?.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }, []);

  // Get all scheduled notifications
  const getScheduledNotifications = useCallback(async (): Promise<NotificationRequest[]> => {
    try {
      return await Notifications?.getAllScheduledNotificationsAsync() || [];
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }, []);
  
  // Get predefined notification templates for common reminders
  const getReminderTemplate = useCallback((
    type: string, 
    plantName?: string
  ): Pick<NotificationOptions, 'title' | 'body'> => {
    const plant = plantName || t('common.yourPlant');
    
    switch (type) {
      case 'water':
        return {
          title: t('notifications.water.title', 'Time to water'),
          body: t('notifications.water.body', `${plant} needs water. Keep it healthy with a good drink.`)
        };
      case 'fertilize':
        return {
          title: t('notifications.fertilize.title', 'Fertilize today'),
          body: t('notifications.fertilize.body', `${plant} needs nutrients. Add fertilizer for better growth.`)
        };
      case 'prune':
        return {
          title: t('notifications.prune.title', 'Pruning needed'),
          body: t('notifications.prune.body', `${plant} could use some pruning to encourage new growth.`)
        };
      case 'repot':
        return {
          title: t('notifications.repot.title', 'Time to repot'),
          body: t('notifications.repot.body', `${plant} needs more space. Consider repotting soon.`)
        };
      case 'check':
        return {
          title: t('notifications.check.title', 'Plant check-up'),
          body: t('notifications.check.body', `Time for a check-up. See how ${plant} is doing.`)
        };
      default:
        return {
          title: t('notifications.general.title', 'Plant care reminder'),
          body: t('notifications.general.body', `Time to check on ${plant}.`)
        };
    }
  }, [t]);

  // Get predefined notification templates for sensor alerts
  const getAlertTemplate = useCallback((
    type: string, 
    systemName?: string,
    reading?: number,
    unit?: string
  ): Pick<NotificationOptions, 'title' | 'body'> => {
    const system = systemName || t('common.yourSystem');
    const readingDisplay = reading !== undefined && unit ? `${reading}${unit}` : '';
    
    switch (type) {
      case 'ph_high':
        return {
          title: t('notifications.alerts.phHigh.title', 'High pH level'),
          body: t('notifications.alerts.phHigh.body', 
            readingDisplay 
              ? `${system} pH is ${readingDisplay}. Adjust to maintain plant health.`
              : `${system} pH is too high. Adjust to maintain plant health.`)
        };
      case 'ph_low':
        return {
          title: t('notifications.alerts.phLow.title', 'Low pH level'),
          body: t('notifications.alerts.phLow.body', 
            readingDisplay 
              ? `${system} pH is ${readingDisplay}. Adjust to maintain plant health.`
              : `${system} pH is too low. Adjust to maintain plant health.`)
        };
      case 'water_temp_high':
        return {
          title: t('notifications.alerts.tempHigh.title', 'High water temperature'),
          body: t('notifications.alerts.tempHigh.body', 
            readingDisplay 
              ? `${system} water is ${readingDisplay}. Cool it down for plant health.`
              : `${system} water temperature is too high. Cool it down.`)
        };
      case 'ec_low':
        return {
          title: t('notifications.alerts.ecLow.title', 'Low nutrient level'),
          body: t('notifications.alerts.ecLow.body', 
            readingDisplay 
              ? `${system} EC is ${readingDisplay}. Add nutrients soon.` 
              : `${system} has low nutrient level. Add nutrients soon.`)
        };
      case 'water_low':
        return {
          title: t('notifications.alerts.waterLow.title', 'Low water level'),
          body: t('notifications.alerts.waterLow.body', `${system} water level is low. Refill soon.`)
        };
      default:
        return {
          title: t('notifications.alerts.general.title', 'System alert'),
          body: t('notifications.alerts.general.body', `${system} needs attention.`)
        };
    }
  }, [t]);

  return {
    permissionStatus,
    pushToken,
    isLoading,
    requestPermissions,
    scheduleReminder,
    scheduleSensorAlert,
    scheduleAchievement,
    cancelNotification,
    getScheduledNotifications,
    getReminderTemplate,
    getAlertTemplate,
  };
}; 