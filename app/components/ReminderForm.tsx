import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button, useTheme } from '@rneui/themed';
import { format } from 'date-fns';
import React, { useState } from 'react';

import { View, StyleSheet } from 'react-native';

import { ReminderType, RepeatInterval } from '../types/reminder';


interface ReminderFormProps {
    initialValues?: {
        title: string;
        type: ReminderType;
        trigger_date: string;
        repeat_interval?: RepeatInterval;
    };
    onSubmit: (values: {
        title: string;
        type: ReminderType;
        trigger_date: string;
        repeat_interval?: RepeatInterval;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState(initialValues?.title || '');
    const [type, setType] = useState<ReminderType>(initialValues?.type || 'system');
    const [triggerDate, setTriggerDate] = useState(
        initialValues?.trigger_date ? new Date(initialValues.trigger_date) : new Date()
    );
    const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>(
        initialValues?.repeat_interval || null
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = () => {
        onSubmit({
            title,
            type,
            trigger_date: triggerDate.toISOString(),
            repeat_interval: repeatInterval,
        });
    };

    return (
        <View style={styles.container}>
            <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Enter reminder title"
                autoFocus
                accessibilityLabel="Reminder title input"
            />

            <View style={styles.typeContainer}>
                <Button
                    title="System"
                    type={type === 'system' ? 'solid' : 'outline'}
                    onPress={() => setType('system')}
                    containerStyle={styles.typeButton}
                />
                <Button
                    title="Journal"
                    type={type === 'journal' ? 'solid' : 'outline'}
                    onPress={() => setType('journal')}
                    containerStyle={styles.typeButton}
                />
                <Button
                    title="Seed"
                    type={type === 'seed' ? 'solid' : 'outline'}
                    onPress={() => setType('seed')}
                    containerStyle={styles.typeButton}
                />
            </View>

            <Button
                title={`Date: ${format(triggerDate, 'MMM d, yyyy h:mm a')}`}
                onPress={() => setShowDatePicker(true)}
                type="outline"
                icon={{
                    name: 'calendar',
                    type: 'material-community',
                    color: theme.colors.primary,
                    size: 20,
                }}
                containerStyle={styles.dateButton}
            />

            {showDatePicker && (
                <DateTimePicker
                    value={triggerDate}
                    mode="datetime"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setTriggerDate(date);
                    }}
                />
            )}

            <View style={styles.repeatContainer}>
                <Button
                    title="Daily"
                    type={repeatInterval === 'daily' ? 'solid' : 'outline'}
                    onPress={() => setRepeatInterval('daily')}
                    containerStyle={styles.repeatButton}
                />
                <Button
                    title="Weekly"
                    type={repeatInterval === 'weekly' ? 'solid' : 'outline'}
                    onPress={() => setRepeatInterval('weekly')}
                    containerStyle={styles.repeatButton}
                />
                <Button
                    title="Monthly"
                    type={repeatInterval === 'monthly' ? 'solid' : 'outline'}
                    onPress={() => setRepeatInterval('monthly')}
                    containerStyle={styles.repeatButton}
                />
                <Button
                    title="None"
                    type={repeatInterval === null ? 'solid' : 'outline'}
                    onPress={() => setRepeatInterval(null)}
                    containerStyle={styles.repeatButton}
                />
            </View>

            <View style={styles.actions}>
                <Button
                    title="Cancel"
                    onPress={onCancel}
                    type="clear"
                    containerStyle={styles.actionButton}
                />
                <Button
                    title="Save"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={!title || isLoading}
                    containerStyle={styles.actionButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    dateButton: {
        marginBottom: 16,
    },
    repeatContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    repeatButton: {
        width: '48%',
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        marginLeft: 8,
    },
}); 