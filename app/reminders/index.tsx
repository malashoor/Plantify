import { Text, Button, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect } from 'react';

import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';

import { ReminderCard } from '../components/ReminderCard';
import { useReminders } from '../hooks/useReminders';
import { useToast } from '../hooks/useToast';


export default function RemindersScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { reminders, isLoading, updateReminder, deleteReminder, getTodaysReminders } = useReminders();
    const { showToast } = useToast();

    useEffect(() => {
        const todaysReminders = getTodaysReminders();
        if (todaysReminders.length > 0) {
            const message = `You have ${todaysReminders.length} plant care actions today.`;
            showToast('info', message);
            Speech.speak(message, {
                language: 'en',
                pitch: 1,
                rate: 0.9,
            });
        }
    }, [reminders]);

    const handleComplete = async (reminderId: string) => {
        updateReminder.mutate({
            id: reminderId,
            input: { status: 'completed' },
        });
    };

    const handleSnooze = async (reminderId: string) => {
        const reminder = reminders?.find(r => r.id === reminderId);
        if (!reminder) return;

        const newDate = new Date(reminder.trigger_date);
        newDate.setHours(newDate.getHours() + 1); // Snooze for 1 hour

        updateReminder.mutate({
            id: reminderId,
            input: {
                status: 'snoozed',
                trigger_date: newDate.toISOString(),
            },
        });
    };

    const handleDismiss = async (reminderId: string) => {
        updateReminder.mutate({
            id: reminderId,
            input: { status: 'dismissed' },
        });
    };

    const pendingReminders = reminders?.filter(r => r.status === 'pending') || [];
    const completedReminders = reminders?.filter(r => r.status === 'completed') || [];

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    colors={[theme.colors.primary]}
                />
            }
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text h4>Reminders</Text>
                    <Button
                        title="New Reminder"
                        onPress={() => router.push('/reminders/new')}
                        icon={{
                            name: 'plus',
                            type: 'material-community',
                            color: 'white',
                            size: 20,
                        }}
                    />
                </View>

                {pendingReminders.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pending</Text>
                        {pendingReminders.map(reminder => (
                            <ReminderCard
                                key={reminder.id}
                                reminder={reminder}
                                onComplete={() => handleComplete(reminder.id)}
                                onSnooze={() => handleSnooze(reminder.id)}
                                onDismiss={() => handleDismiss(reminder.id)}
                            />
                        ))}
                    </View>
                )}

                {completedReminders.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Completed</Text>
                        {completedReminders.map(reminder => (
                            <ReminderCard
                                key={reminder.id}
                                reminder={reminder}
                                onComplete={() => {}}
                                onSnooze={() => {}}
                                onDismiss={() => deleteReminder.mutate(reminder.id)}
                            />
                        ))}
                    </View>
                )}

                {reminders?.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            No reminders yet. Create one to get started!
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
}); 