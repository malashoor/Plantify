import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface ReminderOptions {
  title: string;
  body: string;
  datetime: Date;
  data?: Record<string, any>;
}

export function useReminders() {
  const scheduleReminder = async (options: ReminderOptions) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('plant-care', {
          name: 'Plant Care',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2E7D32',
        });
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
        },
        trigger: options.datetime,
      });
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  };

  const scheduleWatering = async (plantId: string, datetime: Date) => {
    return scheduleReminder({
      title: 'Time to Water Your Plant',
      body: 'Your plant needs watering to stay healthy and grow strong.',
      datetime,
      data: { type: 'watering', plantId },
    });
  };

  const scheduleFertilization = async (plantId: string, datetime: Date) => {
    return scheduleReminder({
      title: 'Time to Fertilize Your Plant',
      body: 'Your plant needs nutrients to support its growth.',
      datetime,
      data: { type: 'fertilization', plantId },
    });
  };

  const scheduleTreatment = async (plantId: string, datetime: Date) => {
    return scheduleReminder({
      title: 'Time for Plant Treatment',
      body: 'Your plant needs treatment to prevent pests and diseases.',
      datetime,
      data: { type: 'treatment', plantId },
    });
  };

  return {
    scheduleWatering,
    scheduleFertilization,
    scheduleTreatment,
  };
} 