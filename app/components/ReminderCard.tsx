import { Card, Text, Icon, Button, useTheme } from '@rneui/themed';
import { format } from 'date-fns';
import React from 'react';

import { View, StyleSheet } from 'react-native';

import { Reminder } from '../types/reminder';


interface ReminderCardProps {
    reminder: Reminder;
    onComplete: () => void;
    onSnooze: () => void;
    onDismiss: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
    reminder,
    onComplete,
    onSnooze,
    onDismiss,
}) => {
    const { theme } = useTheme();

    const getTypeIcon = (type: Reminder['type']) => {
        switch (type) {
            case 'journal':
                return { name: 'book', color: theme.colors.primary };
            case 'seed':
                return { name: 'sprout', color: theme.colors.success };
            case 'system':
                return { name: 'cog', color: theme.colors.warning };
            default:
                return { name: 'bell', color: theme.colors.grey3 };
        }
    };

    const icon = getTypeIcon(reminder.type);

    return (
        <Card containerStyle={styles.card}>
            <View style={styles.header}>
                <Icon
                    name={icon.name}
                    type="material-community"
                    color={icon.color}
                    size={24}
                />
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{reminder.title}</Text>
                    <Text style={styles.date}>
                        {format(new Date(reminder.trigger_date), 'MMM d, yyyy h:mm a')}
                    </Text>
                </View>
            </View>

            {reminder.repeat_interval && (
                <View style={styles.repeatContainer}>
                    <Icon
                        name="repeat"
                        type="material-community"
                        color={theme.colors.grey3}
                        size={16}
                    />
                    <Text style={styles.repeatText}>
                        Repeats {reminder.repeat_interval}
                    </Text>
                </View>
            )}

            <View style={styles.actions}>
                <Button
                    title="Complete"
                    onPress={onComplete}
                    icon={{
                        name: 'check',
                        type: 'material-community',
                        color: 'white',
                        size: 20,
                    }}
                    containerStyle={styles.actionButton}
                />
                <Button
                    title="Snooze"
                    onPress={onSnooze}
                    type="outline"
                    icon={{
                        name: 'clock-outline',
                        type: 'material-community',
                        color: theme.colors.primary,
                        size: 20,
                    }}
                    containerStyle={styles.actionButton}
                />
                <Button
                    title="Dismiss"
                    onPress={onDismiss}
                    type="clear"
                    icon={{
                        name: 'close',
                        type: 'material-community',
                        color: theme.colors.error,
                        size: 20,
                    }}
                    containerStyle={styles.actionButton}
                />
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleContainer: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    repeatContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    repeatText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
}); 