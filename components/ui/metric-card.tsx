import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';

type MetricCardProps = {
  icon: React.ReactElement;
  value: string | number;
  label: string;
  status?: 'normal' | 'warning' | 'error';
  style?: ViewStyle;
  testID?: string;
};

export const MetricCard = ({
  icon,
  value,
  label,
  status = 'normal',
  style,
  testID,
}: MetricCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return Colors.Indicator.Warning;
      case 'error':
        return Colors.Indicator.Error;
      default:
        return Colors.Indicator.Success;
    }
  };

  const iconWithColor = React.isValidElement(icon)
    ? React.cloneElement(icon, { color: getStatusColor() })
    : icon;

  return (
    <Card
      style={[styles.card, style]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={styles.iconContainer}>
        {iconWithColor}
      </View>
      <Text style={styles.value}>
        {value}
      </Text>
      <Text style={styles.label}>
        {label}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    minWidth: 120,
    minHeight: 120,
  },
  iconContainer: {
    marginBottom: Spacing.SM,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.Text.Primary,
    marginBottom: Spacing.XS,
  },
  label: {
    fontSize: 14,
    color: Colors.Text.Secondary,
    textAlign: 'center',
  },
}); 