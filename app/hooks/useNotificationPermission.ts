import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/utils/i18n';

let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // Only loads on native
  // eslint-disable-next-line import/no-extraneous-dependencies
  Notifications = require('expo-notifications');
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'never-asked';

export const PERMISSION_STORAGE_KEY = 'notification_permission_status';
export const FEATURE_INTRODUCTION_KEY = 'feature_introduction_shown';

// Custom showAlert function for cross-platform compatibility
function showAlert(title: string, message: string, buttons?: any[], options?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
    window.alert(`${title}\n${message}`);
  } else if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
    (globalThis as any).alert(`${title}\n${message}`);
  } else {
    // fallback: do nothing
  }
}

export const useNotificationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Check current permission status on mount
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        setIsLoading(true);
        // First check if we've stored the status
        const storedStatus = await AsyncStorage.getItem(PERMISSION_STORAGE_KEY);
        if (storedStatus === 'never-asked') {
          setPermissionStatus('never-asked');
          setIsLoading(false);
          return;
        }
        // Then check the actual system permission status
        const { status } = (await Notifications?.getPermissionsAsync?.()) || { status: 'undetermined' };
        setPermissionStatus(status as PermissionStatus);
        // Update our stored value to match reality
        await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, status as PermissionStatus);
      } catch (error) {
        console.error('Error checking notification permission:', error);
        setPermissionStatus('undetermined');
      } finally {
        setIsLoading(false);
      }
    };
    checkPermissionStatus();
  }, []);

  // Request permission with context-aware prompt
  const requestPermission = async (featureContext?: string): Promise<boolean> => {
    try {
      // Check if feature has been introduced before asking
      const featureIntroShown = await AsyncStorage.getItem(FEATURE_INTRODUCTION_KEY);
      if (!featureIntroShown && !featureContext) {
        // Don't show permission prompt if feature hasn't been introduced yet
        return false;
      }
      // Show a context-aware native alert before the system prompt
      // This improves the chance users will accept the permission
      const customMessage = featureContext 
        ? t('notifications.permission.contextPrompt', {
            feature: featureContext,
            defaultValue: `Enable notifications for ${featureContext}?`,
          })
        : t('notifications.permission.growCyclePrompt', 
            'Enable grow-cycle reminders to get notified when your plants need attention?');
      return new Promise((resolve) => {
        showAlert(
          t('notifications.permission.title', 'Stay Connected to Your Plants'),
          customMessage,
          [
            {
              text: t('common.notNow', 'Not now'),
              style: 'cancel',
              onPress: async () => {
                // Mark as explicitly asked but not granted
                await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, 'never-asked');
                setPermissionStatus('never-asked');
                resolve(false);
              },
            },
            {
              text: t('common.enable', 'Enable'),
              onPress: async () => {
                // Request system permission
                const { status } = (await Notifications?.requestPermissionsAsync?.()) || { status: 'undetermined' };
                setPermissionStatus(status as PermissionStatus);
                await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, status as PermissionStatus);
                resolve(status === 'granted');
              },
            },
          ],
          { cancelable: true }
        );
      });
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Mark a specific feature as introduced so we can show permission prompt
  const markFeatureIntroduced = async () => {
    await AsyncStorage.setItem(FEATURE_INTRODUCTION_KEY, 'true');
  };

  return {
    permissionStatus,
    isLoading,
    requestPermission,
    markFeatureIntroduced,
  };
}; 