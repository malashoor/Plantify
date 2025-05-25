import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, StyleSheet } from 'react-native';

interface FilterControlsProps {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    onApply: () => void;
    onExport?: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onApply,
    onExport
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            accessible={true}
            accessibilityRole="toolbar"
            accessibilityLabel="Date range filter controls"
        >
            <View style={styles.datePickers}>
                <View style={styles.datePickerContainer}>
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={(_, date) => date && onStartDateChange(date)}
                        accessibilityLabel="Select start date"
                    />
                </View>
                <View style={styles.datePickerContainer}>
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={(_, date) => date && onEndDateChange(date)}
                        accessibilityLabel="Select end date"
                    />
                </View>
            </View>
            <View style={styles.buttons}>
                <Button
                    title="Apply"
                    onPress={onApply}
                    accessibilityLabel="Apply date range filter"
                />
                {onExport && (
                    <Button
                        title="Export"
                        onPress={onExport}
                        type="outline"
                        accessibilityLabel="Export analytics data"
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    datePickers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    datePickerContainer: {
        flex: 1,
        marginHorizontal: 8,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
}); 