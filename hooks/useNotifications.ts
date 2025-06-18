// Simple stub for smoke test
export const useNotifications = () => {
  return {
    permissionStatus: 'granted',
    pushToken: null,
    isLoading: false,
    requestPermissions: () => Promise.resolve(true),
    scheduleReminder: () => Promise.resolve(),
    cancelReminder: () => Promise.resolve(),
    cancelAllReminders: () => Promise.resolve(),
    getScheduledReminders: () => Promise.resolve([]),
    getPlantById: () => Promise.resolve(null),
    getAlertTemplate: () => ({ title: '', body: '' }),
  };
}; 