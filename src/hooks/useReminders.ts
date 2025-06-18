import { useState, useEffect } from 'react';
import { SmartWateringService, WateringAdjustment } from '../services/SmartWateringService';
import { useWeather } from './useWeather';
import { Seed } from '../types/seed';
import { useTranslation } from 'react-i18next';

export interface Reminder {
  id: string;
  seedId: string;
  type: 'watering' | 'fertilizing' | 'pruning';
  scheduledDate: Date;
  completed: boolean;
  smartAdjustment?: WateringAdjustment;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { weather } = useWeather();
  const { t } = useTranslation();

  useEffect(() => {
    // Mock reminders data
    const mockReminders: Reminder[] = [
      {
        id: '1',
        title: 'Water Lettuce Garden',
        description: 'Check water levels and top up if needed',
        scheduledDate: new Date(),
        completed: false,
        type: 'watering',
        systemId: '1',
        seedId: 'lettuce',
      },
      {
        id: '2',
        title: 'Add Nutrients to Herb Tower',
        description: 'Add balanced nutrient solution',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completed: false,
        type: 'fertilizing',
        systemId: '2',
        seedId: 'herb',
      },
      {
        id: '3',
        title: 'Monitor pH Levels',
        description: 'Check and adjust pH levels for all systems',
        scheduledDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        completed: false,
        type: 'monitoring',
      },
    ];

    setReminders(mockReminders);
  }, []);

  const evaluateSmartWatering = async (reminder: Reminder, seed: Seed): Promise<Reminder> => {
    if (reminder.type !== 'watering' || !weather) {
      return reminder;
    }

    const adjustment = await SmartWateringService.evaluateWatering(
      seed,
      weather,
      reminder.scheduledDate
    );

    return {
      ...reminder,
      smartAdjustment: adjustment,
      scheduledDate: adjustment.shouldSkip ? adjustment.nextWateringDate : reminder.scheduledDate,
    };
  };

  const getUpcomingReminders = async (seeds: Seed[]): Promise<Reminder[]> => {
    const upcoming = reminders.filter(reminder => !reminder.completed);

    // Apply smart watering adjustments
    const adjustedReminders = await Promise.all(
      upcoming.map(async reminder => {
        const seed = seeds.find(s => s.id === reminder.seedId);
        if (!seed) return reminder;
        return evaluateSmartWatering(reminder, seed);
      })
    );

    return adjustedReminders;
  };

  const createReminder = async (
    seed: Seed,
    type: Reminder['type'],
    date: Date
  ): Promise<Reminder> => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      seedId: seed.id,
      type,
      scheduledDate: date,
      completed: false,
    };

    // Apply smart watering adjustment if applicable
    if (type === 'watering') {
      return evaluateSmartWatering(reminder, seed);
    }

    setReminders(prev => [...prev, reminder]);
    return reminder;
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev =>
      prev.map(reminder => (reminder.id === id ? { ...reminder, ...updates } : reminder))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const markCompleted = (id: string) => {
    updateReminder(id, { completed: true });
  };

  const getRemindersBySystem = (systemId: string) => {
    return reminders.filter(reminder => reminder.systemId === systemId);
  };

  return {
    reminders,
    getUpcomingReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markCompleted,
    getRemindersBySystem,
  };
};
