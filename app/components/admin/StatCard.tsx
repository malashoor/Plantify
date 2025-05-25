import { Text, useTheme } from '@rneui/themed';
import React from 'react';

import { View, StyleSheet } from 'react-native';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    accessibilityLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    accessibilityLabel
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={accessibilityLabel || `${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
        >
            <Text
                style={[styles.title, { color: theme.colors.grey3 }]}
                accessibilityRole="header"
            >
                {title}
            </Text>
            <Text
                style={[styles.value, { color: theme.colors.primary }]}
                accessibilityRole="text"
            >
                {value}
            </Text>
            {subtitle && (
                <Text
                    style={[styles.subtitle, { color: theme.colors.grey2 }]}
                    accessibilityRole="text"
                >
                    {subtitle}
                </Text>
            )}
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
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
    },
}); 