import { useRouter } from 'expo-router';
import React from 'react';

import { View, StyleSheet } from 'react-native';

import { ReminderForm } from '../components/ReminderForm';
import { useReminders } from '../hooks/useReminders';

export default function NewReminderScreen() {
    const router = useRouter();
    const { createReminder } = useReminders();

    const handleSubmit = (values: {
        title: string;
        type: 'journal' | 'seed' | 'system';
        trigger_date: string;
        repeat_interval?: 'daily' | 'weekly' | 'monthly' | null;
    }) => {
        createReminder.mutate(values, {
            onSuccess: () => {
                router.back();
            },
        });
    };

    return (
        <View style={styles.container}>
            <ReminderForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isLoading={createReminder.isPending}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
}); 