import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import type { NotificationRequest } from 'expo-notifications';
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // Only loads on native
  // eslint-disable-next-line import/no-extraneous-dependencies
  Notifications = require('expo-notifications');
}

import { supabase } from '../lib/supabase';
import { 
    Reminder, 
    CreateReminderInput, 
    UpdateReminderInput,
    ReminderContextType,
    HydroponicTaskCategory
} from '../types/reminder';
import { useToast } from './useToast';

const REMINDERS_QUERY_KEY = 'reminders';

export const useReminders = (contextType?: ReminderContextType, category?: HydroponicTaskCategory) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // Fetch reminders with optional filtering by context and category
    const { data: reminders, isLoading } = useQuery({
        queryKey: [REMINDERS_QUERY_KEY, { contextType, category }],
        queryFn: async () => {
            let query = supabase
                .from('reminders')
                .select('*')
                .order('trigger_date', { ascending: true });
            
            // Apply filters if provided
            if (contextType) {
                query = query.eq('context_type', contextType);
            }
            
            if (category) {
                query = query.eq('category', category);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data as Reminder[];
        },
    });

    // Create reminder
    const createReminder = useMutation({
        mutationFn: async (input: CreateReminderInput) => {
            const { data, error } = await supabase
                .from('reminders')
                .insert([input])
                .select()
                .single();

            if (error) throw error;
            return data as Reminder;
        },
        onSuccess: async (reminder) => {
            await queryClient.invalidateQueries({ queryKey: [REMINDERS_QUERY_KEY] });
            await scheduleNotification(reminder);
            showToast('success', 'Reminder created successfully');
        },
        onError: (error) => {
            showToast('error', 'Failed to create reminder');
            console.error('Create reminder error:', error);
        },
    });

    // Update reminder
    const updateReminder = useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateReminderInput }) => {
            const { data, error } = await supabase
                .from('reminders')
                .update(input)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Reminder;
        },
        onSuccess: async (reminder) => {
            await queryClient.invalidateQueries({ queryKey: [REMINDERS_QUERY_KEY] });
            await scheduleNotification(reminder);
            showToast('success', 'Reminder updated successfully');
        },
        onError: (error) => {
            showToast('error', 'Failed to update reminder');
            console.error('Update reminder error:', error);
        },
    });

    // Delete reminder
    const deleteReminder = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: async (_, id) => {
            await queryClient.invalidateQueries({ queryKey: [REMINDERS_QUERY_KEY] });
            await Notifications?.cancelScheduledNotificationAsync(id);
            showToast('success', 'Reminder deleted successfully');
        },
        onError: (error) => {
            showToast('error', 'Failed to delete reminder');
            console.error('Delete reminder error:', error);
        },
    });

    // Get today's reminders
    const getTodaysReminders = () => {
        if (!reminders) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return reminders.filter(reminder => {
            const triggerDate = new Date(reminder.trigger_date);
            return triggerDate >= today && triggerDate < tomorrow && reminder.status === 'pending';
        });
    };

    // Get reminders by context type
    const getRemindersByContext = (context: ReminderContextType) => {
        if (!reminders) return [];
        return reminders.filter(reminder => reminder.context_type === context);
    };

    // Get reminders by category (for hydroponic tasks)
    const getRemindersByCategory = (taskCategory: HydroponicTaskCategory) => {
        if (!reminders) return [];
        return reminders.filter(reminder => reminder.category === taskCategory);
    };

    // Get upcoming reminders for next N days
    const getUpcomingReminders = (days: number = 7) => {
        if (!reminders) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = new Date(today);
        future.setDate(future.getDate() + days);

        return reminders.filter(reminder => {
            const triggerDate = new Date(reminder.trigger_date);
            return triggerDate >= today && triggerDate < future && reminder.status === 'pending';
        });
    };

    return {
        reminders,
        isLoading,
        createReminder,
        updateReminder,
        deleteReminder,
        getTodaysReminders,
        getRemindersByContext,
        getRemindersByCategory,
        getUpcomingReminders,
    };
};

// Helper function to schedule notifications
async function scheduleNotification(reminder: Reminder) {
    if (Platform.OS === 'web') return;

    const triggerDate = new Date(reminder.trigger_date);
    const now = new Date();

    if (triggerDate <= now) return;

    // Set body message based on context and emotion tone
    let body = 'Time to check your plant!';
    
    if (reminder.context_type === 'hydroponic') {
        switch (reminder.category) {
            case 'daily_check':
                body = 'Time for daily system check.';
                break;
            case 'nutrient_refill':
                body = 'Your hydroponic system needs nutrient refill.';
                break;
            case 'harvest_alert':
                body = 'Plants are ready for harvest!';
                break;
            case 'ph_balance':
                body = 'Time to check and adjust pH levels.';
                break;
            case 'water_change':
                body = 'Water change due for your hydroponic system.';
                break;
            case 'system_clean':
                body = 'Time to clean your hydroponic system.';
                break;
            default:
                body = 'Hydroponic task reminder.';
        }
    } else if (reminder.context_type === 'medication') {
        body = 'Medication reminder.';
    }
    
    // Adjust tone based on emotion_tone if present
    if (reminder.emotion_tone) {
        switch (reminder.emotion_tone) {
            case 'positive':
                body = '😊 ' + body + ' Your plants will thank you!';
                break;
            case 'urgent':
                body = '⚠️ ' + body + ' This needs your immediate attention.';
                break;
            case 'gentle':
                body = '🌱 ' + body + ' When you have a moment.';
                break;
            // neutral is default, no change needed
        }
    }

    await Notifications?.scheduleNotificationAsync({
        content: {
            title: reminder.title,
            body: body,
            data: { 
                reminderId: reminder.id,
                context: reminder.context_type,
                category: reminder.category,
                priority: reminder.priority
            },
        },
        trigger: {
            date: triggerDate,
        },
        identifier: reminder.id,
    });
} 