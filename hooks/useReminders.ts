import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: Date;
  frequency: 'once' | 'daily' | 'weekly';
  isCompleted: boolean;
  plantId?: string;
  plantName?: string;
  category: 'watering' | 'fertilizing' | 'pruning' | 'monitoring' | 'general';
  notificationId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = '@greensai_reminders';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reminders from storage on mount
  useEffect(() => {
    loadReminders();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (err) {
      console.error('Error requesting notification permissions:', err);
    }
  };

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const remindersWithDates = parsed.map((reminder: any) => ({
          ...reminder,
          time: new Date(reminder.time),
          createdAt: new Date(reminder.createdAt),
          updatedAt: new Date(reminder.updatedAt),
        }));
        setReminders(remindersWithDates);
      } else {
        // Initialize with sample reminders for demo
        const sampleReminders = await createSampleReminders();
        setReminders(sampleReminders);
        await saveReminders(sampleReminders);
      }
    } catch (err) {
      console.error('Error loading reminders:', err);
      setError('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const saveReminders = async (remindersToSave: Reminder[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remindersToSave));
    } catch (err) {
      console.error('Error saving reminders:', err);
      throw new Error('Failed to save reminders');
    }
  };

  const scheduleNotification = async (reminder: Reminder): Promise<string | undefined> => {
    try {
      const trigger = createNotificationTrigger(reminder);
      if (!trigger) return undefined;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.description || `Time for ${reminder.category}`,
          data: { reminderId: reminder.id },
        },
        trigger,
      });

      return notificationId;
    } catch (err) {
      console.error('Error scheduling notification:', err);
      return undefined;
    }
  };

  const createNotificationTrigger = (reminder: Reminder) => {
    const now = new Date();
    const reminderTime = new Date(reminder.time);

    switch (reminder.frequency) {
      case 'once':
        if (reminderTime <= now) return null; // Don't schedule past reminders
        return { date: reminderTime };

      case 'daily':
        return {
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          repeats: true,
        };

      case 'weekly':
        return {
          weekday: reminderTime.getDay() + 1, // Sunday = 1
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          repeats: true,
        };

      default:
        return null;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (err) {
      console.error('Error canceling notification:', err);
    }
  };

  const addReminder = async (
    reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'notificationId'>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const newReminder: Reminder = {
        ...reminderData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule notification if reminder is active
      if (newReminder.isActive) {
        const notificationId = await scheduleNotification(newReminder);
        if (notificationId) {
          newReminder.notificationId = notificationId;
        }
      }

      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      await saveReminders(updatedReminders);

      return newReminder;
    } catch (err) {
      console.error('Error adding reminder:', err);
      setError('Failed to add reminder');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      setIsLoading(true);
      setError(null);

      const reminderIndex = reminders.findIndex(r => r.id === id);
      if (reminderIndex === -1) {
        throw new Error('Reminder not found');
      }

      const currentReminder = reminders[reminderIndex];

      // Cancel existing notification if it exists
      if (currentReminder.notificationId) {
        await cancelNotification(currentReminder.notificationId);
      }

      const updatedReminder: Reminder = {
        ...currentReminder,
        ...updates,
        updatedAt: new Date(),
      };

      // Schedule new notification if needed
      if (
        updatedReminder.isActive &&
        (updates.time || updates.frequency || updates.title || updates.description)
      ) {
        const notificationId = await scheduleNotification(updatedReminder);
        updatedReminder.notificationId = notificationId;
      }

      const updatedReminders = [...reminders];
      updatedReminders[reminderIndex] = updatedReminder;

      setReminders(updatedReminders);
      await saveReminders(updatedReminders);

      return updatedReminder;
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError('Failed to update reminder');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const reminderToDelete = reminders.find(r => r.id === id);
      if (!reminderToDelete) {
        throw new Error('Reminder not found');
      }

      // Cancel notification if it exists
      if (reminderToDelete.notificationId) {
        await cancelNotification(reminderToDelete.notificationId);
      }

      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      await saveReminders(updatedReminders);

      return true;
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError('Failed to delete reminder');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markComplete = async (id: string) => {
    try {
      await updateReminder(id, {
        isCompleted: true,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Error marking reminder complete:', err);
      setError('Failed to mark reminder complete');
      throw err;
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) throw new Error('Reminder not found');

      await updateReminder(id, { isActive: !reminder.isActive });
    } catch (err) {
      console.error('Error toggling reminder active state:', err);
      setError('Failed to toggle reminder');
      throw err;
    }
  };

  const refreshReminders = async () => {
    await loadReminders();
  };

  const getUpcomingReminders = (days: number = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return reminders
      .filter(reminder => {
        if (!reminder.isActive || reminder.isCompleted) return false;

        const reminderTime = new Date(reminder.time);
        return reminderTime >= now && reminderTime <= futureDate;
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const getRemindersByCategory = (category: Reminder['category']) => {
    return reminders.filter(reminder => reminder.category === category);
  };

  const getTodaysReminders = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return reminders
      .filter(reminder => {
        if (!reminder.isActive || reminder.isCompleted) return false;

        const reminderTime = new Date(reminder.time);
        return reminderTime >= startOfDay && reminderTime < endOfDay;
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  return {
    reminders,
    isLoading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    markComplete,
    toggleActive,
    refreshReminders,
    getUpcomingReminders,
    getRemindersByCategory,
    getTodaysReminders,
  };
}

// Helper function to create sample reminders
async function createSampleReminders(): Promise<Reminder[]> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      title: 'Water Tomato Plants',
      description: 'Check soil moisture and water if needed',
      time: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      frequency: 'daily',
      isCompleted: false,
      plantId: 'tomato-1',
      plantName: 'Cherry Tomatoes',
      category: 'watering',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '2',
      title: 'Fertilize Herbs',
      description: 'Apply liquid fertilizer to basil and mint',
      time: tomorrow,
      frequency: 'weekly',
      isCompleted: false,
      plantId: 'herbs-1',
      plantName: 'Kitchen Herbs',
      category: 'fertilizing',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '3',
      title: 'Check Plant Health',
      description: 'Inspect all plants for pests and diseases',
      time: nextWeek,
      frequency: 'weekly',
      isCompleted: false,
      category: 'monitoring',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
