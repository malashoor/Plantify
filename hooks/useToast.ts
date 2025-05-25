import * as Haptics from 'expo-haptics';
import Toast, { ToastShowParams } from 'react-native-toast-message';

import { AccessibilityInfo, Platform } from 'react-native';

import { HydroponicError } from '../types/errors';

interface ToastOptions extends Partial<ToastShowParams> {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  position?: 'top' | 'bottom';
}

export const useToast = () => {
  const showToast = async ({
    message,
    type = 'info',
    duration = 3000,
    position = 'top',
    ...rest
  }: ToastOptions) => {
    // Provide haptic feedback based on toast type
    if (Platform.OS !== 'web') {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }

    // Announce message for screen readers
    AccessibilityInfo.announceForAccessibility(message);

    Toast.show({
      type,
      text1: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 50,
      bottomOffset: 40,
      ...rest,
    });
  };

  const showError = (error: unknown) => {
    const hydroError = HydroponicError.fromError(error);
    showToast({
      type: 'error',
      message: hydroError.message,
    });
  };

  const showSuccess = (message: string) => {
    showToast({
      type: 'success',
      message,
    });
  };

  return {
    showToast,
    showError,
    showSuccess,
  };
}; 