import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

jest.mock('expo-notifications');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

describe('useNotifications', () => {
  let hook;

  beforeEach(() => {
    jest.clearAllMocks();
    hook = useNotifications();
  });

  describe('Permission Handling', () => {
    it('should check permissions on mount', async () => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });

    it('should request permissions when not granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      await hook.requestPermissions();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should not request permissions when already granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
      await hook.requestPermissions();
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  describe('Scheduling', () => {
    it('should schedule a one-time notification', async () => {
      const options = {
        title: 'Test',
        body: 'Test body',
        trigger: { seconds: 3600 }
      };

      await hook.scheduleReminder(options);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(options);
    });

    it('should schedule a recurring notification', async () => {
      const options = {
        title: 'Test',
        body: 'Test body',
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true
        }
      };

      await hook.scheduleReminder(options);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(options);
    });

    it('should cancel a scheduled notification', async () => {
      const id = '123';
      await hook.cancelReminder(id);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(id);
    });
  });

  describe('Notification Handlers', () => {
    it('should set up notification handlers', () => {
      expect(Notifications.setNotificationHandler).toHaveBeenCalled();
    });

    it('should add notification received listener', () => {
      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    });

    it('should add notification response listener', () => {
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle network state changes', async () => {
      NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });
      await hook.checkNetworkState();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastNetworkCheck', expect.any(String));
    });

    it('should handle permission denied state', async () => {
      Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      await hook.requestPermissions();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('notificationPermissionDenied', 'true');
    });

    it('should clean up on unmount', () => {
      const cleanup = hook.cleanup;
      cleanup();
      expect(Notifications.removeNotificationSubscription).toHaveBeenCalled();
    });
  });
}); 